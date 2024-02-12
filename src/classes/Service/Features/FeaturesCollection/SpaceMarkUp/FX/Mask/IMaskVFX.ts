import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';

export interface IMaskVFX {

	setMaterial(material:NodeMaterial):void;
	
	setStrength(val:number):void;
	enabled(active:boolean):void;

	
	dispose(): void;
}