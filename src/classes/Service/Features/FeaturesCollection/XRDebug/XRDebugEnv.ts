import {inject, injectable} from 'inversify';
import {AbstractFeatureEnv} from '~/classes/Service/Features/Share/AbstractFeatureEnv';
import {XRDebugFeature} from '~/classes/Service/Features/FeaturesCollection/XRDebug/XRDebugFeature';
import {DefaultDebugCFG} from '@classes/Service/Features/FeaturesCollection/XRDebug/Resources/DefaultDebugCFG';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {IDebugXRFeatEnv} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeatEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {Constructor} from 'type-fest';
import type {TDebugFeatureOptions} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

@injectable()
export class XRDebugEnv extends AbstractFeatureEnv<IDebugXRFeature> implements IDebugXRFeatEnv {
	
	protected _featureName:TXRFeatureNames      =   'XR_DEBUG';
	protected _nativeName:string                =   'xr-cl-debug';
	protected _featureOptions:TDebugFeatureOptions;
	protected _nativeFeature:IDebugXRFeature;
	
	// Должна быть обязательно для кастомов
	protected _nativeConstructor:Constructor<IDebugXRFeature> = XRDebugFeature;

	protected static DefaultDebugCFG = DefaultDebugCFG;
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	async init(
		helper:WebXRDefaultExperience,
		options?:TDebugFeatureOptions,
		extendOptions?:unknown
	){
		
		const finalOptions:TDebugFeatureOptions = options || {slots:{}};
		if (!options?.slots){
			finalOptions.slots  =   XRDebugEnv.DefaultDebugCFG.slots;
		}
		
		await super.init(helper, finalOptions, extendOptions);
	}
}