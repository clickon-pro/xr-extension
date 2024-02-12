import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TUserStateFeatureOptions} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TUserStateFeatureOptions';
import type {IUserStateXRFeature} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/IUserStateXRFeature';

// Обеспечивает считывание положения камер и прочего что потребуется
// Раз в какое-то количество кадров кидает стейт в поток или можно читать по необходимости,
// отключаа поток
export interface IUserStateXRFeatEnv extends IXRFeatEnv<IUserStateXRFeature> {
	
	init(
		helper:WebXRDefaultExperience,
		nativeOptions?:TUserStateFeatureOptions
	):Promise<void>;
}