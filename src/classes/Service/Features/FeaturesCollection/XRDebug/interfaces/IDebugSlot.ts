import {Camera}                 from '@babylonjs/core/Cameras/camera';
import type {Scene}             from '@babylonjs/core/scene';
import type {TSlotsDescription} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';


export interface IDebugSlot {
	
	init(
		name:string,
		scene:Scene,
		options:TSlotsDescription,
		camera?:Camera
	):Promise<void>;
	
	print(text:string, addEmptyStringAtTheEnd?:boolean, solid?:boolean):void;
	
	dispose():void;


}