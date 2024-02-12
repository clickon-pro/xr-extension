import {Observable} from 'rxjs';
import type {TQueProcessorOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/TQueProcessorOptions';
import type {TGesturePayload} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGesturePayload';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TGestureInformation} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';

// Нагрузка для комбинаций
export type CombinationInfoPayloads = {
	COMBINATION: {
		combinationName?:string,
		extraPayload?:TGesturePayload,
	},
	SYS: {
		nope?:boolean
		endHold?:boolean
	}
}

export type TCombinationInfo = {
	[key in keyof CombinationInfoPayloads]:{
		type: key,
		repoName: string,
		descriptor: CombinationInfoPayloads[key]
	};
}[keyof CombinationInfoPayloads]

export interface ICombinationsProcessor {
	readonly combination$:Observable<TCombinationInfo>;
	
	init(options?:TQueProcessorOptions, debugFeature?:IDebugXRFeature):Promise<void>;
	isGesturePresentInCombinationRepo(gestureName:string):boolean;
	pushGesture(gesture:TGestureInformation):void;
	dispose():void;
}