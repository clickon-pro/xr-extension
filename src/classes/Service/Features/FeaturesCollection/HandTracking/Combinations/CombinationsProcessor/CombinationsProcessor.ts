import {defaultsDeep, isEqualWith} from 'lodash';
import {Subject } from 'rxjs';
import {MiniReportLoggerCmb} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/MiniReportLoggerCmb/MiniReportLoggerCmb';
import type {ICombinationsProcessor, TCombinationInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/ICombinationsProcessor';
import type {TQueProcessorOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/TQueProcessorOptions';
import type {ICombinationsRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsRepo/ICombinationsRepo';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TGestureInformation, TGesturePosSemanticANY, TGesturePosSemanticX} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";
import type {IMiniReportLoggerCmb} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/MiniReportLoggerCmb/IMiniReportLoggerCmb';

export type TQueueRecord = {
	lastTime:number,
	qnt:number,
	gesture:TGestureInformation
}

export class CombinationsProcessor implements ICombinationsProcessor {
	
	private _combination$   =   new Subject<TCombinationInfo>();
	private _que:TQueueRecord[]                 =   [];
	private _options:TQueProcessorOptions       =   {
														maxQueueLength:10,
														gestureLifeTimeMS:2400,
														maxReplies:1000,
														lifeTimeTickMS:1000,
														nopeMinTimeMS:800
													};
	private _lifeTimeId:number | undefined;
	private _nopeTimeId:number | undefined;
	private _isLastSendWasNope = true;
	private _debugFeature?:IDebugXRFeature;
	
	// Коибинпуия на удержании
	private _combinationHoldGestureName:string | undefined;
	
	private static RIGHT_SIDE:TGesturePosSemanticX[]    =   ['XR1', 'XR2', 'XR3', 'XR4'];
	private static LEFT_SIDE:TGesturePosSemanticX[]     =   ['XL1', 'XL2', 'XL3', 'XL4'];
	
	protected _miniLogger?:IMiniReportLoggerCmb | undefined;
	
	constructor(
		protected _combinationsRepo:ICombinationsRepo,
		protected logger:ILogger
	) {
		this.logger.log('CombinationsProcessor', 'info', 'add');
	}
	
	
	get combination$(){
		return this._combination$;
	}
	
	
	async init(
		options?: TQueProcessorOptions,
		debugFeature?:IDebugXRFeature
	): Promise<void> {
		this.logger.log('CombinationsProcessor', 'info', 'init');
		this._options       =   defaultsDeep(options, this._options);
		this._debugFeature  =   debugFeature;
		
		if(this._options.debugConfig){
			if (this._options.debugConfig.activateMiniReports && this._options.debugConfig.logQue){
				this._miniLogger = new MiniReportLoggerCmb(
					this._options.debugConfig.miniReportEveryXms || 5000,
					this.logger,
					debugFeature,
					this._options.debugConfig.combinationSlotName,
					this._options.debugConfig.queSlotName
				);
			}
			
			if (this._options.debugConfig.outSlotName && this._options.debugConfig.outSlotName.length){
				const slotName = this._options.debugConfig.outSlotName;
				this._debugFeature?.print(slotName, '');
				this._debugFeature?.print(slotName, 'Max Queue Length: ' + this._options.maxQueueLength.toString(), );
				this._debugFeature?.print(slotName,'Gesture life time: ' + this._options.gestureLifeTimeMS.toString());
				this._debugFeature?.print(slotName,'Life time tick: ' + this._options.lifeTimeTickMS!.toString());
				this._debugFeature?.print(slotName,'Max Replies: ' + this._options.maxReplies!.toString(), true);
				this._debugFeature?.print(slotName,'Nope min time: ' + this._options.nopeMinTimeMS!.toString(), true);
			}
		}
	}
	
	
	// Есть ли в комбинациях такой жест
	public isGesturePresentInCombinationRepo(gestureName:string):boolean{
		let res = false;
		for (let combinationName of this._combinationsRepo.keys()) {
			const comb = this._combinationsRepo.get(combinationName);
			res = Boolean(comb?.seq.find((v)=>{
				return Boolean(v.templateName == gestureName);
			}));
			if(res) break;
		}
		return res;
	}
	
	
	pushGesture(gesture:TGestureInformation): void {
		
		// this._debugFeature?.print('flow', gesture.templateName);
		
		// Обслужим nope
		if(gesture.templateName == 'NOPE'){
			this.nopeHandler();
			return;
		}
		
		// Любой жест - не nope сбросит nope-таймер
		clearTimeout(this._nopeTimeId);
		this._nopeTimeId = undefined;
		
		// У нас есть комбинация на холде
		if(this._combinationHoldGestureName) {
			// И это жест не соотвествует захолденному
			// !!! Мы ничего не делаем, если у нас холд и комбинация соотвествует запомненному холд-имени
			if (
				(this._combinationHoldGestureName != gesture.templateName)
			) {
				// Пройдут 2 события сброс холда и следующая фигура
				this.dropHoldHandle();
				// БУДЕТ ПРОДОЛЖЕНИЕ ОБРАБОТКИ ЖЕСТА (gestureHandler)
			}else{
				// Эта фигура уже на холде
				return;
			}
		}
		
		// Запись комбинации в очередь
		// Если очередь имеет записи
		this.gestureHandler(gesture);
    }
	
	
	protected dropHoldHandle(){
		// Забросим сброс холда
		this._combination$?.next({
			repoName:'',
			type:'SYS',
			descriptor:{
				endHold:true
			}
		});
		this._combinationHoldGestureName = undefined;
	}
	
	protected nopeHandler(){
		// Очистка очереди должна происходить, только когда NOPE продержался достаточно долго
		// это для того, чтобы пока пользователь меняет одну фигуру на другую не происходил nope
		// и очередь не очищалась
		
		// Первый nope ставит таймер и любой не nope ДОЛЖЕН его снять
		// Если таймер истекает, то очередь очищается
		
		if(!this._nopeTimeId){
			this._nopeTimeId = setTimeout(()=>{
				// Прошло достаточно времени для того, чтобы посчитать, что случился NOPE
				this._que = [];
				
				if (!this._isLastSendWasNope){
					const hold = Boolean(this._combinationHoldGestureName);
					if(this._combinationHoldGestureName) this._combinationHoldGestureName = undefined;
					this._combination$?.next({
												repoName:'',
												type:'SYS',
												descriptor: {
													nope: true,
													endHold:hold
												}
					});
					this._isLastSendWasNope = true;
				}
				this._nopeTimeId = undefined;
			}, this._options.nopeMinTimeMS);
		}
	}
	
	
	// Обслуживание жеста
	protected gestureHandler(gesture:TGestureInformation){
		if (this._que.length){
			const lastRecord = this._que[this._que.length-1];
			
			// Если пришедшая фигура такая же, как последняя в очереди
			// мы просто увеличм счётчик
			if (this.isGesturesExactMatched(gesture, lastRecord.gesture)){
				lastRecord.qnt      +=  1;
				lastRecord.lastTime =   Date.now();
				// Если жест держится слишком долго,
				// он сбрасывает последовательность и записывает первым жестом себя
				if (lastRecord.qnt > this._options.maxReplies){
					// TODO переделать на время
					this._que       =   [lastRecord];
				}
			}else{
				this.addNewRecordInQueue(gesture);
			}
		}else{
			this.addNewRecordInQueue(gesture);
		}
		this.normalizeQueueLength()
		this.tick();
		this._miniLogger?.registerQue(this._que);
	}
	
	
	// Сравнивает 2 записи в очереди с учётом полного совпадения пространственной семантики
	private isGesturesExactMatched(
		gestureA:TGestureInformation,
		gestureB:TGestureInformation
	):boolean{
		
		const res = Boolean(
			(gestureA.templateName == gestureB.templateName)
			&& (
				(gestureA.r?.semantic[0].x      ==  gestureB.r?.semantic[0].x)
				&& (gestureA.r?.semantic[0].y   ==  gestureB.r?.semantic[0].y)
				&& (gestureA.r?.semantic[0].z   ==  gestureB.r?.semantic[0].z)
			)
			&& (
				(gestureA.l?.semantic[0].x      ==  gestureB.l?.semantic[0].x)
				&& (gestureA.l?.semantic[0].y   ==  gestureB.l?.semantic[0].y)
				&& (gestureA.l?.semantic[0].z   ==  gestureB.l?.semantic[0].z)
			)
		);
		
		this.logQue('--> ' + res, false);
		return res;
	}
	
	
	// Новая запись
	private addNewRecordInQueue(gesture:TGestureInformation){

		this._que.push({
			lastTime:Date.now(),
			qnt:1,
			gesture:gesture
		});
		
		// Запуск таймера
		clearInterval(this._lifeTimeId);
		this._lifeTimeId = setInterval(()=>{
			this.checkLifeTime();
		},this._options.lifeTimeTickMS);
	}
	
	
	// Проверить lifetime
	private checkLifeTime(){
		const neoQue:TQueueRecord[] = [];
		
		// Формируем новую очередь, убирая из неё устаревшие записи
		this._que.forEach((record, index) => {
			if ((Date.now() - record.lastTime) < this._options.gestureLifeTimeMS){
				neoQue.push(record);
			}
		});
		
		this._que = neoQue;
		if (this._que.length > 0){
			clearInterval(this._lifeTimeId);
		}
	}
	
	
	// Сокращение длины очереди до максимально возможного
	// за счёт выбрасывания ранних записей и оставлением хвостика
	private normalizeQueueLength(){
		const mL = this._options.maxQueueLength;
		if (this._que.length > mL){
			// console.log('NORMALIZE LEN')
			this._que = this._que.slice(this._que.length-mL, mL + 1);
		}
	}

	
	// Квант обработки
	private tick(): void {
		
		this.logQue('\n Tick start ====================');
		
        // анализ совпадений
		// Перебираем комбинации из нашего репозитория
	    for (let combinationName of Array.from(this._combinationsRepo.keys())){
			
			const combination = this._combinationsRepo.get(combinationName);
			if (
				combination
				// чтобы откинуть комбинации длиннее очереди
				&& (combination.seq.length <= this._que.length)
			){
				this.logQue('start check combName: ' + combination.name);
				
				// хвост очереди размера, который соотвествует длине проверяемой комбинации
				const partQue = this._que.slice(this._que.length - combination.seq.length, this._que.length);
				
				// Подсчитываем совпадения (все ли записи в очереди совпадают с записями в проверяемой комбинации)
				let matchCount = 0;
				for (let i= 0; i < partQue.length; i++){
					this.logQue('check: in que ' + partQue[i].gesture.templateName + ' with in comb: ' + combination.seq[i].templateName);
					if (
						this.isMatchWithCombinationsSeqElement(partQue[i].gesture, combination.seq[i])
					){
						this.logQue(': TRUE', true);
						matchCount++;
					}else{
						this.logQue(': FALSE', false);
					}
				}
				
				this.logQue('matches qnt: ' + matchCount.toString() + '/' + partQue.length.toString());
				
				// РАСПОЗНАНА КОМБИНАЦИЯ
				if (matchCount == partQue.length){
					// Если эта комбинация с удержанием, активируем флаг удержания
					if (combination.holdLast){
						this._combinationHoldGestureName = combination.seq[combination.seq.length-1].templateName;
					}else{
						this._combinationHoldGestureName = undefined;
					}
					
					// Очистим очередь
					this._que = [];
					// Отметим комбинацию в репорте
					this._miniLogger?.registerRecognition(combinationName);
					// Отправим наверх
					this.sendCombination(combinationName);
					
					this._isLastSendWasNope = false;
					break;
				}
			}
	    }
		
		if(this._options.debugConfig?.logQue && this._options.debugConfig.queSlotName){
			this._debugFeature?.print(this._options.debugConfig.queSlotName, 'Tick end -------------- \n');
		}
    }
	
	
	// Сравниваем 2 фигуры
	protected isMatchWithCombinationsSeqElement(
		gestureA:TGestureInformation,
		gestureB:TGestureInformation,
	):boolean{
		if (gestureA.templateName != gestureB.templateName) return false;
		
		const processHand = (hand:'r' | 'l'):boolean =>{
			let res = true;
			
			if (
				this.isHaveRealSemanticForHand(gestureA, hand)
				&& this.isHaveRealSemanticForHand(gestureB, hand)
			) {
				// Если оба жеста имеют семантику, продолжаем сравнение
				this.logQue('Semantic present');
				
				res = false;
				for (let i = 0; i < gestureA[hand]!.semantic.length; i++) {
					for (let j = 0; j < gestureB[hand]!.semantic.length; j++) {
						if (
							isEqualWith(gestureA[hand]!.semantic[i], gestureB[hand]!.semantic[j],
								(a, b)=>{
									return Boolean(
										this.checkByXAxis(a.x, b.x)
										&& ((a.y == b.y) || (a.y == 'ANY') || (b.y == 'ANY'))
										&& ((a.z == b.z) || (a.z == 'ANY') || (b.z == 'ANY'))
									);
								}
							)
						) {
							res = true;
							// break;
						}
						if(this._options.debugConfig && this._options.debugConfig.logQue) {
							const gA = gestureA[hand]!.semantic[i].x + ' / ' + gestureA[hand]!.semantic[i].y + ' / ' + gestureA[hand]!.semantic[i].z;
							const gB = gestureB[hand]!.semantic[j].x + ' / ' + gestureB[hand]!.semantic[j].y + ' / ' + gestureB[hand]!.semantic[j].z;
							this.logQue('sm ' + ' ' + i + ',' + j + ' ' + (res ? '+ ' : '- ') + gA + '<?>' + gB);
						}
						if(res) break;
					}
					if (res) break;
				}
			}else{
				this.logQue('Semantic missed');
			}
			return res;
		}
		
		let r = true;
		let l = true;
		if(gestureA.r && gestureB.r) r = processHand('r');
		if(gestureA.l && gestureB.l) l = processHand('l');
		
		return r && l;
	}
	
	
	// Проверяем есть ли какая-либо семантика в информации
	private isHaveRealSemanticForHand(gesture:TGestureInformation, hand:'r' | 'l'):boolean{
		return Boolean(
			!!gesture[hand]
			&& (typeof gesture[hand] == 'object')
			&& ('semantic' in gesture[hand]!)
			&& gesture[hand]!.semantic.length
		);
	}
	
	
	// Проверяет совпадает ли индекс
	private checkByXAxis(
		a:TGesturePosSemanticX | TGesturePosSemanticANY,
		b:TGesturePosSemanticX | TGesturePosSemanticANY):boolean{
		if ((a == 'ANY') || (b == 'ANY')) return true;
		
		// !!!!
		if ((a == 'XC') && (b == 'XC')) return true;
		if ((a == 'XR') && (b == 'XR')) return true;
		if ((a == 'XL') && (b == 'XL')) return true;
		
		if ((a == 'XR') && CombinationsProcessor.RIGHT_SIDE.includes(b)) return true;
		if ((b == 'XR') && CombinationsProcessor.RIGHT_SIDE.includes(a)) return true;
		
		if ((a == 'XL') && CombinationsProcessor.LEFT_SIDE.includes(b)) return true;
		if ((b == 'XL') && CombinationsProcessor.LEFT_SIDE.includes(a)) return true;
		
		return (a == b);
	}
	
	
	// Отправим сообщение о комбинации
	protected sendCombination(combinationName:string){
		this._combination$?.next(
			{
				repoName:'', // имя будет навешено выше в трансляторе
				type:'COMBINATION',
				descriptor:{
					combinationName:combinationName,
					extraPayload:{
						// по факту нам этот кватернион не нужен сейчас, так как
						// каждый кадр идёт синхронизация
						// gazeOrientation:new Quaternion()
					}
				}
			}
		);
	}
	
	
	// Логгирование очереди
	protected logQue(info:string, solid?:boolean){
		if(this._options.debugConfig?.logQue && this._options.debugConfig.queSlotName){
			console.log(info);
			this._debugFeature?.print(this._options.debugConfig.queSlotName, info, false, solid);
		}
	}
	
	
	dispose(){
		this._miniLogger?.dispose();
		//@ts-ignore
		this._miniLogger = null;
		
		this._combination$?.complete();
		//@ts-ignore
		this._combination$ = null;
		this.logger.dispose('CombinationsProcessor');
	}
}