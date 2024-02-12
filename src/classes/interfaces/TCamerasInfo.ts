import {TargetCamera} from  '@babylonjs/core/Cameras/targetCamera';
import {WebXRCamera} from   '@babylonjs/core/XR/webXRCamera';

export type TCamerasInfo = {
	camera?:WebXRCamera,
	left?:TargetCamera,
	right?:TargetCamera
}