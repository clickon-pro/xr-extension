import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TTeleportFeatureOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TTeleportFeatureOptions';
import type {ITeleportXRFeature} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportXRFeature';

export interface ITeleportXRFeatureEnv extends IXRFeatEnv<ITeleportXRFeature> {
	
	init(
		helper:WebXRDefaultExperience,
		options?:TTeleportFeatureOptions
	):Promise<void>;
}