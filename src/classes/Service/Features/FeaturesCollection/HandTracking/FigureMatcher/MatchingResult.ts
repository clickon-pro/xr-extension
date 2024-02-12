import type {IMatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IMatchingResult';

export class MatchingResult implements IMatchingResult {
	
	constructor(
		templateName?:string
	) {
		this.templateName = templateName;
	}
	
    templateName: string | undefined = undefined;
    isMatch: boolean = false;
    hands: ('r' | 'l')[] = [];
}