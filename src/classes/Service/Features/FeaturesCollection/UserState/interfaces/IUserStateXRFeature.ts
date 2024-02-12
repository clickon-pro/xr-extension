import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {Observable}             from 'rxjs';
import type {IWebXRFeature}     from '@babylonjs/core/XR/webXRFeaturesManager';
import type {TXRUserState}      from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TXRUserState';

export interface IUserStateXRFeature extends IWebXRFeature {
	
	activateFlowSending(val?: boolean): void;
	
	setHelper(helper: WebXRDefaultExperience): void;
	
	getUserState(): TXRUserState;
	
	readonly flow$:Observable<TXRUserState>;
}