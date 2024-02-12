import {Observable}                 from 'rxjs';
import {WebXRState}                 from '@babylonjs/core/XR/webXRTypes';
import {WebXRDefaultExperience}     from '@babylonjs/core/XR/webXRDefaultExperience';
import {TransformNode}              from '@babylonjs/core/Meshes/transformNode';
import type {Scene}                 from '@babylonjs/core/scene';
import type {IInitable}             from '~/classes/interfaces/IInitable';
import type {XRExtensionConfig}     from '@classes/interfaces/XRExtensionConfig';
import type {TXRCommand}            from '@classes/interfaces/TXRCommand';
import type {IXRCheckerPublic}      from '~/classes/Service/XRChecker/IXRChecker';
import type {TCamerasInfo}          from '@classes/interfaces/TCamerasInfo';
import type {TXRFeatureNames}       from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {IXRFeatEnv}            from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {IKeepInfoAux}          from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {INavigateInSpaceAux}   from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';
import type {TNameToInterfaceMapForFeatures} from '@classes/Service/Features/Share/interfaces/TNameToInterfaceMapForFeatures';

export interface IXRService extends IInitable{
	
	// data flows
	readonly xrState$:Observable<WebXRState>;
	readonly xrCommand$:Observable<TXRCommand>;
	readonly whenFeatureAttached$:Observable<IXRFeatEnv>;
	
	readonly xrChecker:IXRCheckerPublic;
	readonly helper:WebXRDefaultExperience | undefined;
	readonly scene:Scene | undefined;
	readonly currentWebXRCameras:TCamerasInfo;
	readonly currentXRStatus:WebXRState;
	readonly xrRoot:TransformNode | undefined;
	
	// Will be called by the service if special settings are needed - call again
	setConfig(config:XRExtensionConfig):void;
	
	isSupportImmersive():Promise<boolean>;
	
	readonly infoKeeper:IKeepInfoAux;
	readonly navigateInSpace:INavigateInSpaceAux;
	
	activateXR(
		// Attempts to save the position and orientation in the scene based on the active camera
		keepActiveCameraState?:boolean
	):Promise<boolean>;
	exitFromXR():Promise<void>;
	extractFeatureEnv<T extends TXRFeatureNames = TXRFeatureNames>
								(featureName:T):TNameToInterfaceMapForFeatures[T] | undefined;
	
	// Remove feature
	removeFeature<T extends TXRFeatureNames = TXRFeatureNames>(featureName:T):undefined;
	
	dispose():void;
}
