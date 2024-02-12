import {inject} from 'inversify';
import {WebXRControllerMovement} from '@babylonjs/core/XR/features/WebXRControllerMovement';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {AbstractFeatureEnv} from '~/classes/Service/Features/Share/AbstractFeatureEnv';
import type {IWebXRControllerMovementOptions} from '@babylonjs/core/XR/features/WebXRControllerMovement';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";
import type {TExtendControllerMovementOptions} from '~/classes/Service/Features/FeaturesCollection/Movement/TExtendControllerMovementOptions';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';


export class FeatMovementEnv extends AbstractFeatureEnv {
	
	protected   _featureName = <TXRFeatureNames>'MOVEMENT';
	protected   _featureOptions:IWebXRControllerMovementOptions;
	protected   _extendOptions:TExtendControllerMovementOptions;
	protected   _nativeFeature:WebXRControllerMovement;
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	async init(
		helper:WebXRDefaultExperience,
		options?:unknown,
		extendOptions?:unknown
	){
		// такую опцию требует фича
		this._featureOptions.xrInput = helper.input;
		await super.init(helper, options, extendOptions);
	}
	

}