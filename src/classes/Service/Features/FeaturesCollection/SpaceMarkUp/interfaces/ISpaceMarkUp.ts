import {Observable} from 'rxjs';
import {FloorsKeeper} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/FloorsKeeper';

import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import type {IWebXRFeature}     from '@babylonjs/core/XR/webXRFeaturesManager';

import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {TReachPointDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TReachPointDescription';
import type {TStepStairInfo} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TStepStairInfo';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';

export interface ISpaceMarkUp extends IWebXRFeature {
	// TODO сделать sleep для всех фич!!!!!
	
	setHelper(helper: WebXRDefaultExperience): void;
	setFloors(floorsArray:FloorsKeeper):void;
	setInfoKeeper(keeper:IKeepInfoAux):void;
	setNavigator(navigator:INavigateInSpaceAux):void;
	setRayLength(len:number):void;
	// ???
	// syncPhysicBodies():void;
	
	run():void;
	pause():void;
	
	borderInfo$:Observable<TReachPointDescription>;
	stairInfo$:Observable<TStepStairInfo>;
}