import {WebXRDefaultExperienceOptions} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene}             from '@babylonjs/core/scene';

import type {IHelperConfigBuilder} from '~/classes/Service/HelperConfigBuilder/IHelperConfigBuilder';
import type {TXRServiceOptions} from '@classes/interfaces/TXRServiceOptions';
import type {XRExtensionConfig} from '@classes/interfaces/XRExtensionConfig';

// Конструирует конфиг для хелпера
export class HelperConfigBuilder implements IHelperConfigBuilder {
	
	protected _scene:Scene;
	protected _options?:TXRServiceOptions;
	protected _extensionConfig?:XRExtensionConfig;
	protected _config:WebXRDefaultExperienceOptions = {};
	
	
	build(
		scene:Scene,
		options?:TXRServiceOptions,
		extensionConfig?:XRExtensionConfig
	): WebXRDefaultExperienceOptions{
		
		this._scene           = scene;
		this._options         = options;
		this._extensionConfig = extensionConfig;
		
		const fns = new Map<string, ()=>void>([
			['floors',                          this.cfgFloors.bind(this)],
			['ui-btn' ,                         this.cfgEnterBtn.bind(this)],
			['disable pointer selection',       this.cfgPointerSelection.bind(this)],
			['disable teleportation',           this.cfgTeleportation.bind(this)],
			['disable near interaction',        this.cfgNearInteraction.bind(this)],
			['features',                        this.cfgFeatures.bind(this)]
		]);
		
		// собрать конфиг
		fns.forEach((fn)=>{
			fn();
		});
		
		// console.log('[XR HELPER RESULT CONFIG]:', this._config);
		
		this._config.optionalFeatures = true;
		return this._config;
	}
	
	
	protected cfgFloors(){
		// console.log('[XR HELPER CONFIG BUILDER]:Floors');
		
		const meshes:AbstractMesh[] = [];
		if (this._options?.floors && this._options.floors.length){
			this._options.floors.forEach((id)=>{
				const mesh = this._scene?.getMeshById(id);
				if (mesh) meshes.push(mesh);
			});
		}
		this._config.floorMeshes = meshes;
	}
	
	protected cfgEnterBtn(){
		this._config.disableDefaultUI = !this._options?.needBabylonUIEnterButton;
	}
	
	// Отключим фичу, если она будет нужна - будет включаться через фичи
	protected cfgPointerSelection(){
		this._config.disablePointerSelection = true;
	}
	
	protected cfgTeleportation(){
		this._config.disableTeleportation = true;
	}
	
	protected cfgNearInteraction(){
		this._config.disableNearInteraction = true;
	}
	
	protected cfgFeatures(){
		this._config.optionalFeatures = [];
		for (let featuresKey in this._options?.features) {
			if (WebXRFeatureName[featuresKey as keyof WebXRFeatureName]){
				// нативная фича
				this._config.optionalFeatures.push(WebXRFeatureName[featuresKey as keyof WebXRFeatureName]);
			}
		}
		// console.log('----------->', this._config.optionalFeatures);
	}
}