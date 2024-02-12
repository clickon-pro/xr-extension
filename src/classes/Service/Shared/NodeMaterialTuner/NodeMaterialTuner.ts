import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';
import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import type {INodeMaterialTuner} from '@classes/Service/Shared/NodeMaterialTuner/INodeMaterialTuner';


export class NodeMaterialTuner implements INodeMaterialTuner {

	tuneBlock(
		material:NodeMaterial,
		blockName:string,
		blockValueName:'value' | 'texture',
		value:Color3 |  number | Texture | string
	){
	
		const block = material.getBlockByName(blockName);
		if(
			block
			&& (blockValueName in block)
		){
			//@ts-ignore
			block[blockValueName] = value;
		}else{
			console.warn('Block not found: ' + blockName);
		}
	}
	
	

	
	
}