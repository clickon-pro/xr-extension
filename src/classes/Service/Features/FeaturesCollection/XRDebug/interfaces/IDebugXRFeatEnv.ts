import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TDebugFeatureOptions} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';


export interface IDebugXRFeatEnv extends IXRFeatEnv<IDebugXRFeature>{
	
	init(
		helper:WebXRDefaultExperience,
		options?:TDebugFeatureOptions,
		additionalOptions?:unknown
	):Promise<void>;
}