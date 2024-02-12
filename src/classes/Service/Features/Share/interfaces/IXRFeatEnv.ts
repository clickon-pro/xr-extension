import {Observable} from 'rxjs';

import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import type {IWebXRFeature}     from '@babylonjs/core/XR/webXRFeaturesManager';

import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TXRCommand} from '@classes/interfaces/TXRCommand';

export interface IXRFeatEnv<NATIVE_FEAT extends IWebXRFeature = IWebXRFeature> {

	readonly featureName:TXRFeatureNames;
	// readonly nativeConstructor:Constructor<IWebXRFeature>;
	init(
		helper:WebXRDefaultExperience,
		options?:unknown,
		additionalOptions?:unknown,
	):Promise<void>;
	
	// Поток команд из фичи (может не быть)
	get cmdFlow$(): Observable<TXRCommand> | undefined;
	
	// Сработает только первый раз
	setFeatureName(string:TXRFeatureNames):void;
	
	readonly isSupport:boolean;
	readonly nativeName:WebXRFeatureName | TXRFeatureNames;
	readonly nativeFeature:NATIVE_FEAT | undefined;
	
	whenAttached():Promise<void>;
	whenDetached():Promise<void>;
	
	dispose():void;
}