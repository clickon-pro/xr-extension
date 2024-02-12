import {isArray}                from 'lodash';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import type {Scene}             from '@babylonjs/core/scene';
import type {ICleaner}          from '~/classes/Service/Cleaner/ICleaner';



// Cleanup after XR session
// These may become unnecessary with newer versions of Babylon
export class Cleaner implements ICleaner {
	
	protected _helper:WebXRDefaultExperience;
	protected _scene:Scene;
	protected _controllersIds:string[] = [];
	
	
	clean(
		helper:WebXRDefaultExperience,
		scene:Scene
	) {
		this._helper = helper;
		
		this.cleanCameras();
		this.cleanControllers();
		this.cleanFeatures();
		//...
		
		// clean
		//@ts-ignore
		this._helper = undefined;
		//@ts-ignore
		this._scene = undefined;
		this._controllersIds = [];
	}
	
	
	// Камеры
	protected cleanCameras(){
		this._helper?.baseExperience.camera.dispose();
	}
	
	
	// Контроллеры
	protected cleanControllers(){
		this._controllersIds = [];
		this._helper?.input.controllers.forEach((controller)=>{
			// Получим ids контроллеров
			this._controllersIds.push(controller.uniqueId);
			
			if (controller.motionController && controller.motionController.rootMesh){
				controller.motionController.rootMesh.dispose();
			}
		});
	}
	
	
	// Фичи
	protected cleanFeatures(){
		const featuresNames = this._helper?.baseExperience.featuresManager.getEnabledFeatures();
		
		featuresNames?.forEach((featName)=> {
			const feature = this._helper?.baseExperience.featuresManager.getEnabledFeature(featName);

			if (featName == WebXRFeatureName.HAND_TRACKING){
				this.handTrackingClean();
			}
			
			feature?.detach();
		});
	}


// No civilized way found. There's a getHandControllerId function, but by this time
// controllers might have already been removed upon session exit.
// Therefore, we're digging inside the object
	protected handTrackingClean(){
		this.clearHandTrackingMeshes();
		this.clearHandTrackingJointMeshes();
		this.clearHandTrackingRigMapping();
		this.clearHandTrackingSkeletons();
	}
	
	
	protected clearHandTrackingMeshes(){
		const hFeat = this._helper?.baseExperience.featuresManager.getEnabledFeature(WebXRFeatureName.HAND_TRACKING);
		//@ts-ignore
		const res = hFeat._handResources?.handMeshes;
		// Здесь  {[ctrlId]:Mesh}
		if (res) {
			if (res) {
				for (let id in res) {
					res[id].skeleton?.dispose();
					if (res[id].parent) {
						res[id].parent.skeleton?.dispose();
						res[id].parent.dispose();
					} else {
						res[id].dispose();
					}
				}
			}
		}
	}
	
	protected clearHandTrackingJointMeshes(){
		const hFeat = this._helper?.baseExperience.featuresManager.getEnabledFeature(WebXRFeatureName.HAND_TRACKING);
		// Здесь  {[ctrlId]:InstancedMesh[]}
		//@ts-ignore
		const res = hFeat._handResources?.jointMeshes;
		if (res){
			for(let id in res){
				if (isArray(res[id])){
					res[id].forEach((mesh:any)=>{
						if (mesh && ('dispose' in mesh)){
							if (mesh.sourceMesh){
								mesh.sourceMesh.dispose();
							}else{
								mesh.dispose();
							}
						}
					});
				}
			}
		}
	}
	
	protected clearHandTrackingRigMapping(){
		const hFeat = this._helper?.baseExperience.featuresManager.getEnabledFeature(WebXRFeatureName.HAND_TRACKING);
		// Здесь  {[ctrlId]:{[transformNodeId]:string}}
		//@ts-ignore
		const res = hFeat._handResources?.rigMappings;
		if (res){
			for(let id in res){
				const ids = Object.keys(res);
				for (let ctrlId of ids){
					Object.keys(res[ctrlId]).forEach(tId=>{
						const list = this._scene?.getTransformNodesById(tId);
						if (list && list.length){
							for (let n of list){
								n.dispose();
							}
						}
					});
				}
			}
		}
	}
	
	protected clearHandTrackingSkeletons(){
		// TODO implement this properly!!!! It might overlap with something
		// The correct deletion path is not found yet
		// Currently, the name is 'skeleton0'
		let skeleton = this._scene?.getSkeletonById('skeleton0');
		while(skeleton){
			skeleton.dispose();
			skeleton = this._scene?.getSkeletonById('skeleton0');
		}
	}
}