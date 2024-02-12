import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import {Vector2}                from '@babylonjs/core/Maths/math.vector';

import {NodeMaterialTuner} from '@classes/Service/Shared/NodeMaterialTuner/NodeMaterialTuner';
import type {IOptionsApplicator} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/IOptionsApplicator';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';
import type {INodeMaterialTuner} from '@classes/Service/Shared/NodeMaterialTuner/INodeMaterialTuner';



export abstract class AbstractOptionsApplicator implements IOptionsApplicator {
	
	protected _tuner:INodeMaterialTuner = new NodeMaterialTuner();
	
	applyOptions(
		options:TTeleportDrawerOptions['placeOptions'],
		material:NodeMaterial,
	){
		
		
		if(options?.visibility){
			this._tuner.tuneBlock(material, 'VISIBILITY', 'value', options.visibility);
		}
		
		if(options?.animationSpeed){
			this._tuner.tuneBlock(material, 'ANIMATION_SPEED', 'value', options.animationSpeed);
		}
		
		if(options?.bordersColorHex){
			const color = Color3.FromHexString(options.bordersColorHex);
			this._tuner.tuneBlock(material, 'BORDERS_COLOR', 'value', color);
		}
		
		if(options?.textureColorHex){
			const color = Color3.FromHexString(options.textureColorHex);
			this._tuner.tuneBlock(material, 'ARROW_COLOR', 'value', color);
		}
		
		if(options?.texture){
			this._tuner.tuneBlock(material, 'ARROW_TEX', 'texture', options.texture);
		}
		
		if(options?.textureScaling){
			let texScaling = new Vector2(Number(options.textureScaling.x)||1,Number(options.textureScaling.y)||1);
			this._tuner.tuneBlock(material, 'TEX_SCALING', 'value', texScaling);
		}
	}
	
}