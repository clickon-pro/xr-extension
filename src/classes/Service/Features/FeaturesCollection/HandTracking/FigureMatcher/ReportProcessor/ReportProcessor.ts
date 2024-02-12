import {cloneDeep} from 'lodash';
import type {IReportProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/ReportProcessor/IReportProcessor';
import type {TFigureRecognizeReport,	TReportLink, TTemplateReport, TWristReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {TJointsLink} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';

export class ReportProcessor implements IReportProcessor {
	
	protected _report:TFigureRecognizeReport = {
													checks: 0,
													recognized: 0,
													accPercent: 0,
													gestures: {},
												};
	
	get report():TFigureRecognizeReport | undefined {
		// Обработка собранного
		this._report.accPercent = this.percents(this._report.recognized, this._report.checks);
		for (let gesturesKey in this._report.gestures) {
			const gRecord = this.resolveTemplateRecord(gesturesKey);
			gRecord.accPercent = this.percents(gRecord.recognized, gRecord.checks);
			
			gRecord.links.forEach((link) => {
				link.accPercent = this.percents(link.match, (link.miss + link.match));
			});
			
			gRecord.wrists.forEach((wrist)=>{
				wrist.pitch.accPercent = this.percents(wrist.pitch.match, (wrist.pitch.match + wrist.pitch.miss));
				wrist.roll.accPercent = this.percents(wrist.roll.match, (wrist.roll.match + wrist.roll.miss));
			});
		}
		return cloneDeep(this._report);
	}
	
	incChecks(){
		this._report.checks++;
	}
	
	incRecognized(){
		this._report.recognized++;
	}
	
	
	registerCheckingWrist(
		templateName:string,
		hand:XRHandedness,
		axis:'Roll' | 'Pitch',
		result:boolean
	):void{
		const record    =   this.resolveWristRecordInReport(templateName, hand);
		if (record){
			const ax = (axis == 'Roll') ? 'roll' : 'pitch';
			if(result){
				record[ax].match++;
			}else{
				record[ax].miss++;
			}
			
		}
	}
	
	
	registerChecking(
					templateName:string,
					link:TJointsLink,
					result:boolean
	){
		const record    =   this.resolveLinkRecordInReport(templateName, link);
		record.link     =   link;
		// const templateRecord = this.resolveTemplateRecord(templateName);
		// templateRecord.checks++;
		
		if(result){
			record.match++;
		}else{
			record.miss++;
		}
	}
	
	
	// Найдёт соотвествующую запись в проходе
	private resolveLinkRecordInReport(templateName:string, link:TJointsLink):TReportLink{
		const templateRecord = this.resolveTemplateRecord(templateName);
		let ret = templateRecord.links.find((record)=>{
			return Boolean(
				(record.link.from.h   == link.from.h)
				&& (record.link.from.id     == link.from.id)
				&& (record.link.to.h        == link.to.h)
				&& (record.link.to.id       == link.to.id)
			);
		});
		if (!ret){
			ret = {
				link:link,
				match:0,
				miss:0,
				accPercent:0
			};
			templateRecord.links.push(ret);
		}
		return ret;
	}
	
	
	// Резолвит записть для шаблона
	protected resolveTemplateRecord(templateName:string):TTemplateReport{
		let record = this._report.gestures[templateName];
		if (!record){
			record = {
				links:[],
				recognized:0,
				checks:0,
				accPercent:0,
				wrists:[
					{
						hand:'left',
						pitch:{
							miss:0,
							match:0,
							accPercent:0
						},
						roll:{
							miss:0,
							match:0,
							accPercent:0
						}
					},
					{
						hand:'right',
						pitch:{
							miss:0,
							match:0,
							accPercent:0
						},
						roll:{
							miss:0,
							match:0,
							accPercent:0
						}
					}
				]
			};
			this._report.gestures[templateName] = record;
		}
		return record;
	}
	
	
	protected resolveWristRecordInReport(templateName:string, hand:XRHandedness):undefined | TWristReport{
		const templateRecord = this.resolveTemplateRecord(templateName);
		return templateRecord.wrists.find((record)=>{
			return (record.hand == hand)
		});
	}
	
	
	// считает проценты
	protected percents(a:number,b:number):number{
		if(b == 0) return 0;
		return Number(((a/b)*100).toFixed(0));
	}
	
	
	dispose(){
	
	}
}