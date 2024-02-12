import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

export interface IAbstractHandsMeshProcessor {
	init(
		helper:WebXRDefaultExperience
	):void;
}