import type {TQueueRecord} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/CombinationsProcessor';

export interface IMiniReportLoggerCmb {
	registerRecognition(
		combinationName:string,
	):void;
	
	registerQue(
		que:TQueueRecord[]
	):void;
	
	dispose():void
}