import {inject} from 'inversify';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {AbstractFeatureEnv} from '@classes/Service/Features/Share/AbstractFeatureEnv';
import {UserStateFeature} from '@classes/Service/Features/FeaturesCollection/UserState/UserStateFeature';
import type {IUserStateXRFeatEnv} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/IUserStateXRFeatEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TUserStateFeatureOptions} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TUserStateFeatureOptions';
import type {Constructor} from 'type-fest';
import type {IUserStateXRFeature} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/IUserStateXRFeature';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

// Обеспечивает считывание положения камер и прочего что потребуется
// Раз в какое-то количество кадров кидает стейт в поток или можно читать по необходимости,
// отключаа поток
export class UserStateEnv extends AbstractFeatureEnv<IUserStateXRFeature> implements IUserStateXRFeatEnv {
	
	
	protected _featureName:TXRFeatureNames      =   'USER_STATE';
	protected _nativeName:string                =   'xr-cl-user-state';
	protected _nativeFeature:IUserStateXRFeature;
	
	protected _featureOptions:TUserStateFeatureOptions = {
		sendStateEveryNXRFrames:1
	};
	
	protected _nativeConstructor:Constructor<IUserStateXRFeature> = UserStateFeature;
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	async init(
		helper:WebXRDefaultExperience,
		nativeOptions?:TUserStateFeatureOptions
	){
		await super.init(helper, Object.assign(this._featureOptions, nativeOptions));
	}
	
	protected async whenFeatureAttached(): Promise<void> {
		this._nativeFeature.setHelper(this._helper);
		return super.whenFeatureAttached();
	}
}