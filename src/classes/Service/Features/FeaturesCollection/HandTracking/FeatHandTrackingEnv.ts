import {inject, injectable}     from 'inversify';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WristCapturer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/WristCapturer/WristCapturer';
import {TemplateBuilder} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/TemplateBuilder/TemplateBuilder';
import {Observable, Subject, Subscription} from 'rxjs';
import {AbstractFeatureEnv} from '~/classes/Service/Features/Share/AbstractFeatureEnv';
import {Recognizer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/Recognizer';
import {GestureCapturer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/GestureCapturer';
import {GesturesRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/GesturesRepo';
import {JointsShower} from '@classes/Service/Features/FeaturesCollection/HandTracking/JointsShower/JointsShower';
import {AnimationRecorder} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/AnimationRecorder';
import type {IWebXRHandTrackingOptions} from '@babylonjs/core/XR/features/WebXRHandTracking';
import type {AbstractMesh}                  from '@babylonjs/core/Meshes/abstractMesh';
import type {IRecognizer}                   from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/IRecognizer';
import type {TExtendHandTrackingOptions}    from '~/classes/Service/Features/FeaturesCollection/HandTracking/TExtendHandTrackingOptions';
import type {IHandTrackingXRFeatEnv}        from '@classes/Service/Features/FeaturesCollection/HandTracking/IHandTrackingXRFeatEnv';
import type {IGestureCapturer}              from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/IGestureCapturer';
import type {IDebugXRFeature}               from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {ICombinationsRepo}             from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsRepo/ICombinationsRepo';
import type {IGesturesRepo}                 from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/IGesturesRepo';
import type {TGestureTemplateNeo, TJointsLink, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TGestureCapturerOption}    from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TGestureMatchOptions}  from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {TLink} from '@classes/interfaces/TLink';
import type {IJointsShower} from '@classes/Service/Features/FeaturesCollection/HandTracking/JointsShower/IJointsShower';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TCombinationInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/ICombinationsProcessor';
import type {TJointAddress} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TJointAddress';
import type {IWristCapturer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/WristCapturer/IWristCapturer';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';
import type {THandsAnimationData} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';
import type {TRecordMode} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TRecordMode';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";


@injectable()
export class FeatHandTrackingEnv extends AbstractFeatureEnv<WebXRHandTracking> implements IHandTrackingXRFeatEnv {
	protected   _featureName = <TXRFeatureNames>'HAND_TRACKING';
	protected   _nativeName = WebXRFeatureName.HAND_TRACKING;
	protected   _framesWatcher:Observer<XRFrame>;

	protected   _featureOptions:IWebXRHandTrackingOptions;
	protected   _extendOptions:TExtendHandTrackingOptions;
	protected   _nativeFeature:WebXRHandTracking;
	
	protected   _recognizer?:IRecognizer;
	protected   _gestureCapturer?:IGestureCapturer;
	protected   _wristsCapturer?:IWristCapturer;
	
	// Может быть множество репозиториев с комбинациями
	protected   _combinationsReposMap  =   new Map<string, ICombinationsRepo>();
	
	protected   _gesturesRepo:IGesturesRepo         =   new GesturesRepo();
	
	protected   _reports:{[repName:string]:TFigureRecognizeReport} = {};

	protected   _jointsShower?:IJointsShower;
	
	protected   _recognizerSup:Subscription | undefined;
	
	// Поток распознанных комбинаций (наружу)
	protected   _combinations$ = new Subject<TCombinationInfo>();
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	async init(
		helper:WebXRDefaultExperience,
		nativeOptions?:Omit<IWebXRHandTrackingOptions, 'xrInput'>,
		extendOptions?:TExtendHandTrackingOptions
	){
		// такую опцию требует фича
		this._featureOptions.xrInput = helper.input;
		
		await super.init(helper, nativeOptions, Object.assign({
			// значения по умолчанию
			checkEveryNFrame:1,
			distanceFromHideHandMeshes:0.85
		}, extendOptions));
	}
	
	
	get combinations$():Observable<TCombinationInfo>{
		return this._combinations$;
	}
	
	
	
	setCaptureOptions(options: Partial<TGestureCapturerOption>) {
		this._extendOptions.captureOptions = Object.assign({}, this._extendOptions.captureOptions, options);
		this._gestureCapturer?.setOptions(options);
	}
	
	
	setRecognizeOptions(options: Partial<TGestureMatchOptions>) {
		this._extendOptions.gestureRecognitionOptions = Object.assign({}, this._extendOptions.gestureRecognitionOptions, options);
		this._recognizer?.setOptions(this._extendOptions.gestureRecognitionOptions);
	}
	
	
	get gesturesRepo():IGesturesRepo{
		return this._gesturesRepo;
	}
	
	
	get combinationsReposMap():Map<string, ICombinationsRepo>{
		return this._combinationsReposMap;
	}
	
	
	// Запустить распознавание
	startRecognize(combinationsRepoName?:string):void{
		this.recognizer().then((recognizer:IRecognizer)=>{
			
			this._framesWatcher?.remove();
			this._framesWatcher = this._helper.baseExperience.sessionManager.onXRFrameObservable.add(async ()=>{
				this.hideHandsMeshesIfTooFarFromCamera();
			});
			
			recognizer.startRecognize(combinationsRepoName);
		});
	}
	
	
	// Остановить распознование.
	// В случае, если указанно конкретное имя и собирался отчёт - вернёт отчёт
	// Если остановка идёт всех рекогнайзеров, то можно запросить отчёты из сохранённого архива
	stopRecognize(combinationsRepoName?:string):TFigureRecognizeReport | undefined{
		this._framesWatcher?.remove();
		if (!combinationsRepoName){
			this.disposeRecognizer();
		}else{
			return this._recognizer?.stopRecognize(combinationsRepoName);
		}
	}
	
	
	// вернуть сохранённый отчёт по имени
	getSavedReportByName(reportName:string):TFigureRecognizeReport | undefined{
		return this._reports[reportName];
	}
	
	
	// вернуть все отчёты
	getSavedReports():{[repName:string]:TFigureRecognizeReport}{
		return this._reports;
	}
	
	
	// Отдаст узлы joints по заказу
	getJoints(hand:XRHandedness, jointsNames:WebXRHandJoint[]):{[key in WebXRHandJoint]+?:TransformNode}{
		const ret:{[key in WebXRHandJoint]+?:TransformNode} = {};
		const nHand = this._nativeFeature.getHandByHandedness(hand);
		if (nHand){
			for (let jointsNamesKey of jointsNames) {
				const joint = nHand.getJointMesh(jointsNamesKey as WebXRHandJoint);
				if(joint){
					ret[jointsNamesKey as WebXRHandJoint] = joint;
				}
			}
		}
		return ret;
	}
	
	
	// Возвращает дистанцию между 2мя джоинтами
	getDistanceBetweenJoints(
		joint1:TJointAddress,
		joint2:TJointAddress
	):number | undefined{
		const mj1   =   this.getJointByAddress(joint1);
		const mj2   =   this.getJointByAddress(joint2);
		
		if(mj1 && mj2){
			return Vector3.Distance(mj1.absolutePosition, mj2.absolutePosition);
		}
	}
	
	
	// Возвращает меш джоинта
	getJointByAddress(joint:TJointAddress):AbstractMesh | undefined{
		if(this._nativeFeature){
			const hand = this._nativeFeature.getHandByHandedness(joint.hand);
			if(hand){
				return hand.getJointMesh(joint.jointName);
			}
		}
	}
	
	
	// Остановить распознавание, запустить захват и вернуть захваченный шаблон
	async captureGestureTemplate(
		name:string,
		// mode:'apple' | 'regular',
		gestureType:TGestureTemplateNeo['type'],
		links:TLink[],
		progressCallBack?:(progress:number)=>void
	):Promise<TGestureTemplateNeo>{
		// 1 Отключим распознавание
		this._recognizer?.stopRecognize();
		
		// 2 работаем в режиме захвата
		const capturer = await this.capturer(); // обеспечим резолвинг захватчика жестов
		
		// Захватим фигуры
		const template = await capturer.capture(name, gestureType, links, progressCallBack);
		
		// Захватим вристы
		// const wristCapturer = await this.wristsCapturer();
		// const angles = await wristCapturer.doCaptureCycle(template.type, progressCallBack);
		
		return template;
	}
	
	
	// Захват вристов
	async captureWristsAngles(
		gestureType:TGestureTemplateNeo['type'],
		template?:TGestureTemplateNeo,
		progressCallBack?:(progress:number)=>void,
		// Асинхронные функции между фазами цикла захвата вристов.
		// Если функции определены, то процесс будет останавливаться до разрешения промисов
		betweenInitialPitchAndLimitPitch?:()=>Promise<void>,
		betweenLimitPitchAndInitialRoll?:()=>Promise<void>,
		betweenInitialRollAndLimitRoll?:()=>Promise<void>
	):Promise<TWristDesc[]>{
		const wristCapturer = await this.wristsCapturer();
		const angles = await wristCapturer.doCaptureCycle(
			gestureType,
			progressCallBack,
			betweenInitialPitchAndLimitPitch,
			betweenLimitPitchAndInitialRoll,
			betweenInitialRollAndLimitRoll
		);
		if(template) await new TemplateBuilder().addWrists(template, angles);
		return angles;
	}
	
	
	// Углы вристов в моменте
	async getCurrentWristsAngles():Promise<TWristAngles[]>{
		const wristCapturer = await this.wristsCapturer();
		return wristCapturer.acquireWrists();
	}
	
	
	// Выдаёт текущее положение вристов в данный момент или ничего
	getCurrentWristsPositions():{
		r:Vector3 | undefined,
		l:Vector3 | undefined
	}{
		const fn = (key:'left' | 'right'):Vector3 | undefined =>{
			let ret:undefined | Vector3;
			const hand = this._nativeFeature?.getHandByHandedness(key);
			if (hand){
				ret = hand.getJointMesh(WebXRHandJoint.WRIST).position;
			}
			return ret;
		}
		
		return {
			r:fn('right'),
			l:fn('left')
		}
	}

	

	
	
	// Отображать отладочные линии, демонстрирующие JOINTS
	createJointsShower(links:TJointsLink[]) {
		if (!this._jointsShower){
			if (this._helper){
				this._jointsShower = new JointsShower(this._helper, this._nativeFeature, links);
			}
		}else{
			this._jointsShower.setLinks(links);
		}
	}
	
	
	showJoints():void{
		this._jointsShower?.show();
	}
	
	
	hideJoints():void{
		this._jointsShower?.hide();
	}
	
	
	disposeJointsShower() {
		this._jointsShower?.dispose();
		this._jointsShower = undefined;
	}
	
	
	protected async recognizer():Promise<IRecognizer>{
		if (!this._recognizer){
			this._recognizer = new Recognizer(
												this._combinationsReposMap,
												this._gesturesRepo,
												this.logger
			);
			
			await this._recognizer.init(
				this._helper,
				this._extendOptions.gestureRecognitionOptions,
			);
			
			// Отправка распознанных комбинаций
			this._recognizerSup     = this._recognizer.gestureCombination$?.subscribe((gInfo:TCombinationInfo)=>{
				this._combinations$.next(gInfo);
			});
		}
		return this._recognizer;
	}
	
	
	protected async capturer():Promise<IGestureCapturer>{
		if(!this._gestureCapturer){
			this._gestureCapturer = new GestureCapturer(this.logger);
			await this._gestureCapturer.init(
				this._helper,
				this._nativeFeature,
				this._extendOptions.captureOptions,
			);
		}
		return this._gestureCapturer;
	}
	
	
	protected async wristsCapturer():Promise<IWristCapturer>{
		if(!this._wristsCapturer){
			this._wristsCapturer = new WristCapturer(this.logger);
			await this._wristsCapturer.init(
				this._helper,
				this._nativeFeature,
				this._extendOptions.captureOptions
			);
		}
		return this._wristsCapturer;
	}
	
	
	protected get debug():IDebugXRFeature | undefined{
		if(this._extendOptions.debugConfig){
			return this._helper.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as (IDebugXRFeature | undefined);
		}
	}

	
	protected async whenFeatureAttached() {
	
	}
	
	
	protected async whenFeatureDetached(): Promise<void> {
		this.stopRecognize();
	}
	
	
	protected hideHandsMeshesIfTooFarFromCamera(){
		const camera = this._helper.baseExperience.camera;
		
		const fn = (key:'left' | 'right')=>{
			const hand = this._nativeFeature?.getHandByHandedness(key);
			if (hand && camera){
				const pos = hand.getJointMesh(WebXRHandJoint.WRIST).position;
				const handDistance = Vector3.Distance(pos, camera.globalPosition);
				const enabled = (handDistance < 0.85);
				hand.handMesh?.setEnabled(enabled);
			}else{
				// если нет руки
			}
		}
		
		fn('left');
		fn('right');
	}
	
	
	// Захватить анимацию рук
	async captureHandsAnimation(
		frames:number,
		mode:TRecordMode,
		delayMS?:number
	):Promise<THandsAnimationData | undefined>{
		const animationRecorder = new AnimationRecorder();
		
		await animationRecorder.init(
										this._helper,
										this._extendOptions.animationCaptureOptions
		);
		
		const record = await animationRecorder.startRecord(frames, mode, delayMS);
		
		// console.log('YYYY', record);
		animationRecorder.dispose();
		// console.log(animationRecorder);
		return record;
	}
	
	
	protected disposeRecognizer(){
		if(this._recognizer){
			this._reports = this._recognizer.getAllCurrentReports();
		}
		
		this._recognizerSup?.unsubscribe();
		this._recognizer?.dispose();
		//@ts-ignore
		this._recognizer        =   null;
	}
	
	
	dispose() {
		// сохранить репорт
		if (this._jointsShower) this.disposeJointsShower();
		
		this._gestureCapturer?.dispose().then(
			()=>{
			//@ts-ignore
			this._gestureCapturer   =   null;
		});
		
		this._framesWatcher?.remove();
		this.disposeRecognizer();
		super.dispose();
	}
}