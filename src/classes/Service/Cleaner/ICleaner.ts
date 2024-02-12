import type {Scene}             from '@babylonjs/core/scene';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

export interface ICleaner {
	clean(
		helper:WebXRDefaultExperience,
		scene:Scene
	):void;
}