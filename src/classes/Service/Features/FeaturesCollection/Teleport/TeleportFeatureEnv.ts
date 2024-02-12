import {inject} from 'inversify';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import {TeleportFeature} from '@classes/Service/Features/FeaturesCollection/Teleport/TeleportFeature';
import {AbstractFeatureEnv} from '@classes/Service/Features/Share/AbstractFeatureEnv';
import type {ITeleportXRFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportXRFeatureEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {Constructor} from 'type-fest';
import type {TTeleportFeatureOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TTeleportFeatureOptions';
import type {ITeleportXRFeature} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportXRFeature';
import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";


export class TeleportFeatureEnv extends AbstractFeatureEnv<ITeleportXRFeature> implements ITeleportXRFeatureEnv {
	
	protected _featureName:TXRFeatureNames              =   'TELEPORT';
	protected _nativeName:string                        =   'xr-cl-teleport';
	protected _featureOptions:TTeleportFeatureOptions   =   {
		floorMeshes:[],
		strength:5,
		gravity:9.81
	};
	
	constructor(
		@inject('InfoKeeper')
		protected _infoKeeper:IKeepInfoAux,
		
		@inject('Navigator')
		protected _navigator:INavigateInSpaceAux,
		
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	// !!! Должна быть обязательно для кастомов
	protected _nativeConstructor:Constructor<ITeleportXRFeature> = TeleportFeature;
	
	async init(
		helper:WebXRDefaultExperience,
		options?:TTeleportFeatureOptions,
	){
		this._featureOptions = Object.assign(this._featureOptions, options);
		await super.init(helper, options);
	}
	
	protected async whenFeatureAttached(): Promise<void> {
		await (this._nativeFeature as unknown as ITeleportXRFeature).init(this._helper);
		this._nativeFeature.setInfoKeeper(this._infoKeeper);
		this._nativeFeature.setNavigate(this._navigator);
	}
}