import type {IMiniReportLoggerFg} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/MiniReportLoggerFg/IMiniReportLoggerFg';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

export class MiniReportLoggerFg implements IMiniReportLoggerFg {
	
	protected _lastPeriod:{figures:{[key:string]:number}} = {
		figures:{}
	};
	
	private _intervalId:number;
	
	constructor(
		reportInterval:number,
		protected logger:ILogger,
		protected debugFeature?:IDebugXRFeature,
		protected slotName?:string
	) {
		
		// Если уже время - выведем
		this._intervalId = setInterval(()=>{
			if (Object.keys(this._lastPeriod.figures).length > 0){
				// Надо выдавать
				this.logger.log(this._lastPeriod.figures, 'info', 'flat');
				this.logger.br();
				
				// Если есть дебаг - фича, тоже выводим
				if (slotName){
					// this.debugFeature?.print(slotName, this.jitter?.next() + " Gesture within " + reportInterval + 'ms');
					for (let lastPeriodKey in this._lastPeriod.figures) {
						this.debugFeature?.print(slotName, lastPeriodKey + ' : ' + this._lastPeriod.figures[lastPeriodKey].toString());
					}
				}
			}
			this._lastPeriod.figures = {};
		}, reportInterval);
	}
	
	// Запишем в короткий репорт для периодической печати
	registerRecognition(
		templateName:string,
	) {
		if (templateName) {
			if (!(templateName in this._lastPeriod.figures)) {
				this._lastPeriod.figures[templateName] = 0;
			}
			this._lastPeriod.figures[templateName]++;
		}
	}
	
	dispose(){
		clearInterval(this._intervalId);
		this.logger.dispose('MiniReportLoggerFg');
	}
}