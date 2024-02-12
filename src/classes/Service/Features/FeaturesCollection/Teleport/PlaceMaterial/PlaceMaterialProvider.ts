import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import type {Scene}             from '@babylonjs/core/scene';

import {NodeMaterialTuner} from '@classes/Service/Shared/NodeMaterialTuner/NodeMaterialTuner';
import type {INodeMaterialTuner} from '@classes/Service/Shared/NodeMaterialTuner/INodeMaterialTuner';
import type {INodeMaterialProvider} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/INodeMaterialProvider';

export class NodeMaterialProvider<OPTIONS extends object = object> implements INodeMaterialProvider<OPTIONS> {
	
	protected _material:NodeMaterial | undefined;
	protected _tuner:INodeMaterialTuner | undefined;
	protected _options:OPTIONS = {} as OPTIONS;
	
	
	async init(
		materialProvider:(scene:Scene)=>NodeMaterial,
		scene:Scene,
		options?:OPTIONS
	){
		this._material  =   materialProvider(scene);
		this._tuner     =   new NodeMaterialTuner();
		this._options   =   Object.assign(this._options, options);
	}
	
	
	setOptions(options:OPTIONS){
		this._options   =   Object.assign(this._options, options);
	}
	
	
	get material(){
		return this._material;
	}
	
	
	dispose(){
		this._material?.dispose();
		//@ts-ignore
		this._material = null;
	}
}