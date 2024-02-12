import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';

import type {IVector2Like} from '@babylonjs/core/Maths/math.like';

export interface INodeMaterialTuner {
	tuneBlock(
		material:NodeMaterial,
		blockName:string,
		blockValueName:'value' | 'texture',
		value:Color3 |  number | Texture | string | IVector2Like
	):void;
}