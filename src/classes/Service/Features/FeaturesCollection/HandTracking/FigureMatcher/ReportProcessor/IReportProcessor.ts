import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {TJointsLink} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';

export interface IReportProcessor {
	readonly report:undefined | TFigureRecognizeReport;
	
	registerChecking(
		templateName:string,
		link:TJointsLink,
		result:boolean
	):void;
	
	registerCheckingWrist(
		templateName:string,
		hand:XRHandedness,
		axis:'Roll' | 'Pitch',
		result:boolean
	):void;
	
	incChecks():void;
	incRecognized():void;
	dispose():void;
}