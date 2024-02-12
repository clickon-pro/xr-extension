import {isEqual} from 'lodash';
// import {Jitter} from '@classes/Service/Shared/Jitter/Jitter';
import type {IMiniReportLoggerCmb} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/MiniReportLoggerCmb/IMiniReportLoggerCmb';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TQueueRecord} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/CombinationsProcessor';


export class MiniReportLoggerCmb implements IMiniReportLoggerCmb {
	
	// TODO больше информации о комбинациях
	
	// private jitter?:Jitter;
	private _intervalId:number;
	protected _lastPeriod:{combinations:{[key:string]:number}} = {
		combinations:{}
	};
	
	protected _lastQue:TQueueRecord[] = [];
	
	constructor(
		intervalTime:number,
		protected logger:ILogger,
		protected debugFeature?:IDebugXRFeature,
		protected combinationSlotName?:string,
		protected queSlotName?:string
	) {
		// this.jitter = new Jitter('rounded_digits');
		
		// Если уже время - выведем
		this._intervalId = setInterval(()=>{
			if (Object.keys(this._lastPeriod.combinations).length > 0){
				// Надо выдавать
				// this.logger.log(this.jitter?.next() + ' Combinations within ' + intervalTime + 'ms', 'info', 'header5');
				this.logger.log(this._lastPeriod.combinations, 'info', 'flat');
				
				// Если есть дебаг - фича, тоже выводим
				if (combinationSlotName){
					// this.debugFeature?.print(combinationSlotName, this.jitter?.next() + " Combinations within " + intervalTime + 'ms');
					for (let lastPeriodKey in this._lastPeriod.combinations) {
						this.debugFeature?.print(combinationSlotName, lastPeriodKey + ' : ' + this._lastPeriod.combinations[lastPeriodKey].toString());
					}
				}
			}
			this._lastPeriod.combinations = {};
		}, intervalTime);
	}
	
	// Запишем в короткий репорт для периодической печати
	registerRecognition(
		combinationName:string,
	) {
		if (combinationName) {
			if (!(combinationName in this._lastPeriod.combinations)) {
				this._lastPeriod.combinations[combinationName] = 0;
			}
			this._lastPeriod.combinations[combinationName]++;
		}
	}
	
	
	registerQue(
		que:TQueueRecord[]
	){
		if (!isEqual(que, this._lastQue)){
			this._lastQue = que;
			this.printQueInLogger();
			this.printQueInXRDebug();
			this.printInConsole();
		}
	}
	
	
	protected printInConsole(){
		if(this._lastQue.length > 0){
			this.logger.log('____QUE____');
			this._lastQue.forEach((rec)=>{
				const out = {
					templateName:rec.gesture.templateName,
					qnt:rec.qnt.toString(),
				};
				if(rec.gesture.r) {
					Object.assign(out, {
						XR: rec.gesture.r?.semantic[0].x.toString(),
						YR: rec.gesture.r?.semantic[0].y.toString(),
						ZR: rec.gesture.r?.semantic[0].z.toString(),
					});
				}
				
				if(rec.gesture.l) {
					Object.assign(out, {
						XL: rec.gesture.l?.semantic[0].x.toString(),
						YL: rec.gesture.l?.semantic[0].y.toString(),
						ZL: rec.gesture.l?.semantic[0].z.toString()
					});
				}
				console.log(out);
			})
			console.log('\n');
		}
	}
	
	
	protected printQueInLogger(){
		if(this.logger && this._lastQue.length > 0){
			this.logger.log('Que', 'info', 'header3');
			this._lastQue.forEach((rec)=>{
				const out = {
					templateName:rec.gesture.templateName,
					qnt:rec.qnt.toString(),
				};
				if(rec.gesture.r) {
					Object.assign(out, {
						XR: rec.gesture.r?.semantic[0].x.toString(),
						YR: rec.gesture.r?.semantic[0].y.toString(),
						ZR: rec.gesture.r?.semantic[0].z.toString(),
					});
				}
				
				if(rec.gesture.l) {
					Object.assign(out, {
						XL: rec.gesture.l?.semantic[0].x.toString(),
						YL: rec.gesture.l?.semantic[0].y.toString(),
						ZL: rec.gesture.l?.semantic[0].z.toString()
					});
				}
				this.logger.log(out, 'info', 'flat');
			})
			this.logger.br();
		}
	}
	
	
	protected printQueInXRDebug(){
		if(this.debugFeature && this.queSlotName && this._lastQue.length > 0){
			let str = 'Que: ';
			
			this._lastQue.forEach((rec)=>{
				str = str   + rec.gesture.templateName + ' ' + '(' + rec.qnt + ')';
				if(rec.gesture.r) {
					str = str + ' R:' + rec.gesture.r?.semantic[0].x.toString() +
						' ' + rec.gesture.r?.semantic[0].y.toString() +
						' ' + rec.gesture.r?.semantic[0].z.toString() + '\n';
				}
				if(rec.gesture.l) {
					str = str + ' L:' + rec.gesture.l?.semantic[0].x.toString() +
						' ' + rec.gesture.l?.semantic[0].y.toString() +
						' ' + rec.gesture.l?.semantic[0].z.toString() + '\n';
				}
			})
			this.debugFeature?.print(this.queSlotName, str);
			this.debugFeature?.print(this.queSlotName, "=============\n");
		}
	}
	
	
	dispose(){
		clearInterval(this._intervalId);
		this.logger.dispose('MiniReportLoggerCmb');
	}
}