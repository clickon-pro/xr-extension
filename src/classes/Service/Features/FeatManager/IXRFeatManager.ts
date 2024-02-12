import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import {Container} from 'inversify';
import {Observable} from 'rxjs';
import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TXRFeaturesConfig} from '@classes/interfaces/XRFeatureConfig';
import type {TXRCommand} from '@classes/interfaces/TXRCommand';

export interface IXRFeatManager {
	
	readonly xrCommandFromFeature$:Observable<TXRCommand>;
	readonly whenFeatureAttached$:Observable<IXRFeatEnv>;
	
	init(
		helper:WebXRDefaultExperience,
		featuresConfig?:TXRFeaturesConfig
	):Promise<void>;
	
	getFeatureEnv(featureName:TXRFeatureNames):IXRFeatEnv | undefined;
	removeFeature(featureName:TXRFeatureNames):void;
	
	// Write only
	parentContainer:Container;

	dispose():void;
}