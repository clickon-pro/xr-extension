import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import type {Scene}             from '@babylonjs/core/scene';

export interface INodeMaterialProvider<OPTIONS> {
	
	init(
		materialProvider:(scene:Scene)=>NodeMaterial,
		scene:Scene,
		options?:OPTIONS
	):Promise<void>;
	
	readonly material:NodeMaterial | undefined;
	
	setOptions(options:OPTIONS):void;
	
	dispose():void;
}