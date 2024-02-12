import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {IMatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IMatchingResult';

export interface IFigureRecognizer {
	
	readonly report:undefined | TFigureRecognizeReport;
	
	init():Promise<void>;
	
	isAnyGestureMatchedWithFigure():IMatchingResult[];
	
	dispose():void;
}