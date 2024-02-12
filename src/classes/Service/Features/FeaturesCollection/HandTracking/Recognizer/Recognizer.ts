import {cloneDeep, defaultsDeep} from 'lodash';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {CombinationsProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/CombinationsProcessor';
import {FigureRecognizer} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/FigureRecognizer';
import {SpaceLocator} from '@classes/Service/Features/FeaturesCollection/HandTracking/SpaceLocator/SpaceLocator';
import {Subject, Subscription} from 'rxjs';
import {GesturesRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/GesturesRepo';
import type {IRecognizer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/IRecognizer';
import type {TGestureMatchOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {ICombinationsProcessor, TCombinationInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/ICombinationsProcessor';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {IFigureRecognizer} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IFigureRecognizer';
import type {ICombinationsRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsRepo/ICombinationsRepo';
import type {IGesturesRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/IGesturesRepo';
import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {ISPaceLocator} from '@classes/Service/Features/FeaturesCollection/HandTracking/SpaceLocator/ISPaceLocator';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";


// TODO добавить расстояния между какими-то дополнительными точками

export class Recognizer implements IRecognizer {
	
	private _gestureMatchOptions:TGestureMatchOptions = {
															checkEveryNFrame:1,
															nopeGestureTimeMS:300
														};
	
	// В этой структуре находятся только работающие (распознаваемые прямо сейчас процессоры)
	protected   _combinationsProcessorsMap:Map<string,  {
															processor:ICombinationsProcessor,
															subscription:Subscription | undefined,
															recognizer:IFigureRecognizer
														}> = new Map();
	
	// private     _nopeDetectionTime:number = 200;
	protected   _helper:WebXRDefaultExperience;
	protected   _framesWatcher:Observer<XRFrame>;
	protected   _spaceLocator:ISPaceLocator | undefined;
	protected   _gestureCombination$  = new Subject<TCombinationInfo>();
	
	constructor(
		protected _combinationsReposMap:Map<string, ICombinationsRepo>,
		protected _gesturesRepo:IGesturesRepo,
		protected logger:ILogger
	){	}
	
	
	// Будет вызываться перед каждой сессией распознавания
	async init(
		helper:WebXRDefaultExperience,
		options?:TGestureMatchOptions
	){
		this.logger.log('Recognizer', 'info', 'init');
		
		this._helper                =   helper;
		this._gestureMatchOptions   =   defaultsDeep(options, this._gestureMatchOptions);
		
		if (this._gestureMatchOptions.debugConfig) {
			const slotName = this._gestureMatchOptions.debugConfig?.outSlotName || 'main';
			this.debugFeature?.print(slotName, 'Recognizer options:');
			this.debugFeature?.print(slotName,'Nope gesture time:' + this._gestureMatchOptions.nopeGestureTimeMS.toString());
			this.debugFeature?.print(slotName,'Check every N frame:' + this._gestureMatchOptions.checkEveryNFrame?.toFixed(0));
		}
		this.logger.log('Recognizer options: ', 'info', 'groupCollapsed');
		this.logger.log(this._gestureMatchOptions, 'info');
		this.logger.log('', 'info', 'groupEnd');
	}
	
	
	// Для установки опций на лету
	setOptions(options: Partial<TGestureMatchOptions>) {
		this._gestureMatchOptions   =   Object.assign(this._gestureMatchOptions, options);
		// TODO сбросить в процессор комбинаций, если надо для изменения логики работы на лету
		// TODO сбросить в распознаватель фигур, если надо
	}
	
	
	// Поток распознанных комбинаций
	get gestureCombination$(){
		return this._gestureCombination$;
	}
	
	
	// Запустить распознавание
	async startRecognize(combinationsRepoName?:string){
		// Запускаем на все
		if(!combinationsRepoName){
			const prs:Promise<ICombinationsProcessor | undefined>[] = [];
			(this._combinationsReposMap.keys() as unknown as Array<string>).forEach((combName:string)=>{
				prs.push(this.provideCombinationProcessor(combName));
			});
			await Promise.all(prs);
		}else{
			// Обеспечивает наличие конкретного комбинационного процессора
			await this.provideCombinationProcessor(combinationsRepoName);
		}
		
		if(!this._spaceLocator){
			this._spaceLocator              =   new SpaceLocator(this.logger, this.debugFeature);
			this._spaceLocator.init(this._helper);
		}
		
		if(this._gesturesRepo.size == 0){
			this.logger.log('Repository is empty. Nothing to recognize!', 'warns', 'warn');
			this.logger.log(['Gestures repo: ', this._gesturesRepo], 'warns');
		}
		
		let fCount:number = 0;
		this._framesWatcher?.remove();
		this._framesWatcher = this._helper.baseExperience.sessionManager.onXRFrameObservable.add(()=>{
			if (fCount >= (this._gestureMatchOptions.checkEveryNFrame || 1)){
				fCount = 0;
				this._combinationsProcessorsMap?.forEach((rec, combName)=>{
					this.recognize(combName, rec.processor, rec.recognizer);
				});
			}else{
				fCount++;
			}
		});
		
		this.logger.log('Recognition started', 'info', 'activate');
		
		// Вывод
		if(
			this._gestureMatchOptions.debugConfig
			&& this._gestureMatchOptions.debugConfig.outSlotName
		){
			const slotName = this._gestureMatchOptions.debugConfig.outSlotName;
			
			// Recognized combination name
			const cName = combinationsRepoName ? ' (' + combinationsRepoName + ') ' : '';
			this.debugFeature?.print(slotName, 'Recognizer started: ' + cName);
			
			// Имена работающих процессоро
			const prcsNames = Array.from(this._combinationsProcessorsMap.keys()).toString();
			this.debugFeature?.print(slotName, 'Processors: ' + prcsNames);
			
			// Gestures
			const gesturesNames = Array.from(this._gesturesRepo.keys()).toString();
			this.debugFeature?.print(slotName, 'Gestures: ' + gesturesNames);
			
			
		}
	}
	
	
	// Остановить распознавание
	// Если не указаны конкретный репо - остановит всё
	stopRecognize(combinationsRepoName?:string):TFigureRecognizeReport | undefined {
		
		let outReport:TFigureRecognizeReport | undefined;
		if(combinationsRepoName){
			outReport = this.stopRecognizeByName(combinationsRepoName);
		}else {
			this._combinationsProcessorsMap.forEach((rec, combinationsRepoName)=>{
				this.stopRecognizeByName(combinationsRepoName);
			});
		}
		if(this._combinationsProcessorsMap.size == 0){
			this._framesWatcher?.remove();
			this.disposeSpaceLocator();
		}
		return outReport;
	}
	
	
	// Получить текущие отчёты
	getAllCurrentReports():{[repName:string]:TFigureRecognizeReport}{
		const ret:{[repName:string]:TFigureRecognizeReport} = {};
		this._combinationsProcessorsMap.forEach((rec, combKey)=>{
			const report = rec.recognizer.report;
			if(report) ret[combKey] = report;
		});
		return ret;
	}
	
	
	// Получить текущий отчёт по имени
	getCurrentReportByName(reportName:string):TFigureRecognizeReport | undefined{
		let ret:TFigureRecognizeReport | undefined;
		const rec = this._combinationsProcessorsMap.get(reportName);
		if (rec){
			ret = rec.recognizer.report;
		}
		return ret;
	}
	
	// Останавиливает распознавание, удаляет запись
	protected stopRecognizeByName(cmbName:string):TFigureRecognizeReport | undefined{
		const rec = this._combinationsProcessorsMap.get(cmbName);
		let report:TFigureRecognizeReport | undefined;
		if (rec){
			rec.subscription?.unsubscribe();
			rec.processor.dispose();
			// сохраним репорт
			report = rec.recognizer.report;
			// this._combinationsReposMap.delete(cmbName);
			this._combinationsProcessorsMap.delete(cmbName);
			this.logger.log('RecognitionTest finished for ' + cmbName, 'info', 'deactivate');
		}
		return report;
	}
	
	
	// Предоставляет распознаватель фигур
	protected async provideFigureRecognizer(gesturesList?:string[]):Promise<IFigureRecognizer | undefined>{
		const figureRecognizer = new FigureRecognizer(
														this._helper,
														this.filteredGesturesRepo(gesturesList),
														this.logger,
														this._gestureMatchOptions.debugConfig,
													);
		await figureRecognizer.init();
		return figureRecognizer;
	}
	
	
	// Отфильтровывает жесты, оставляя только те, которые упоминаются в комбинациях
	protected filteredGesturesRepo(list?:string[]):IGesturesRepo{
		const filteredRepo = new GesturesRepo();
		
		list?.forEach((gName)=>{
			const figure   =   this._gesturesRepo.get(gName);
			if(figure) {
				filteredRepo.set(gName, cloneDeep(figure));
			}
		});
		
		return filteredRepo;
	}
	
	
	// Гарантирует комбинационный процессор по имени
	// protected _combinationSubscription:Map<string,Subscription | undefined> = new Map();
	protected async provideCombinationProcessor(name:string):Promise<ICombinationsProcessor | undefined>{
		if(
			!this._combinationsProcessorsMap.has(name)
			&& this._combinationsReposMap.has(name)
		){
			const combRepo =    this._combinationsReposMap.get(name);
			if(combRepo){
				const cProcessor                    =    new CombinationsProcessor(combRepo, this.logger);
				
				const gesturesList          =   this.gestureNamesListByCombinations(combRepo);
				const figureRecognizer  =   await this.provideFigureRecognizer(gesturesList);
				
				// console.log('NAME ', name);
				
				if (figureRecognizer) {
					this._combinationsProcessorsMap.set(name, {
						processor: cProcessor,
						subscription: undefined,
						recognizer: figureRecognizer
					});
					const record = this._combinationsProcessorsMap.get(name);
					
					if(record?.processor){
						await record.processor.init(
							this._gestureMatchOptions.combinationProcessorOptions,
							this.debugFeature
						);
						
						// Транслятор
						record.subscription = record.processor.combination$.subscribe((x)=> {
							const translate = cloneDeep(x) as TCombinationInfo;
							translate.repoName = name;
							// Навесим имя на комбинацию
							this._gestureCombination$.next(translate);
						});
						return cProcessor;
					}
				}else{
					this.logger.log('Missed recognizer for combination ' + name, 'warns', 'warn');
				}
			}
		}
	}
	
	
	// Выбирает все
	protected gestureNamesListByCombinations(combRepo:ICombinationsRepo):string[]{
		const list:string[] = [];
		combRepo.forEach((rec)=>{
			rec.seq.forEach((rec)=>{
				if (!list.includes(rec.templateName)){
					list.push(rec.templateName);
				}
			});
		});
		return list;
	}
	
	
	// private lastReportPrintTime = this._gestureMatchOptions.debugConfig?.figuresReportEveryXms || 5000;
	protected recognize(combName:string, processor:ICombinationsProcessor, recognizer:IFigureRecognizer){
		const matchedResult = recognizer.isAnyGestureMatchedWithFigure();
		// Не было распознано ничего за эту итерацию
		if (matchedResult.length == 0){
			this.nopeGestureProcess(processor);
		}else{
			matchedResult.forEach((mResult)=>{
				// Закинем распознанный жест, снабдив его информацией о пространственном положении
				const template = this._gesturesRepo.get(mResult.templateName!);
				if (template){
					const infoWithSemantic = this._spaceLocator?.getLocation(mResult);
					if (infoWithSemantic) {
						
						// this.debugFeature?.print('flow', 'ss' + infoWithSemantic.r?.semantic[0].x || '');
						
						// Чтобы формировалась инфо о том, как составляется комбинация
						// Жест пушанём
						processor.pushGesture(infoWithSemantic);
					}
				}
			});
		}
	}
	
	
	
	// Когда ничего было распознано ничего за эту итерацию
	protected nopeGestureProcess(combProcessor:ICombinationsProcessor){
		// Фиксируем NOPE-жест В ТОМ ПРОЦЕССОРЕ, к которому он относится
		// Жест, который в процессоре А может считаться за NOPE (нет совпадений)
		// В другом процессоре может быть вполне жестом
		combProcessor.pushGesture({templateName:'NOPE'});
	}
	
	
	// Дебаг - фича
	protected get debugFeature():IDebugXRFeature | undefined {
		if(this._gestureMatchOptions.debugConfig){
			return this._helper!.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as IDebugXRFeature | undefined;
		}
	}
	
	
	protected disposeSpaceLocator(){
		this._spaceLocator?.dispose();
		this._spaceLocator = undefined;
	}
	
	
	dispose(){
		this._gestureCombination$.unsubscribe();
		//@ts-ignore
		this._gestureCombination$ = undefined;
		this._framesWatcher?.remove();
		
		// Очистка процессоров и рекогнайзеров
		this._combinationsProcessorsMap.forEach((rec, combinationsRepoName)=>{
			this.stopRecognizeByName(combinationsRepoName);
		});
		
		//@ts-ignore
		this._combinationsProcessorsMap = null;
		this.disposeSpaceLocator();
		this.logger.dispose('Recognizer');
	}
}