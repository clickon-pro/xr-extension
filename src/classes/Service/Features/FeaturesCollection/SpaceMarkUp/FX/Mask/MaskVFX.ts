import {MeshBuilder}            from '@babylonjs/core/Meshes/meshBuilder';
import {Camera}                 from '@babylonjs/core/Cameras/camera';
import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import {InputBlock}             from '@babylonjs/core/Materials/Node/Blocks/Input/inputBlock';
import {Scalar}                 from '@babylonjs/core';

import type {IMaskVFX}          from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/FX/Mask/IMaskVFX';
import {Mesh}                   from '@babylonjs/core/Meshes/mesh';

// Реализует эффект маскирования
export class MaskVFX implements IMaskVFX{
	
	protected _isActive                =   false;
	protected _fxMaterial?:NodeMaterial;
	protected _sphere?:Mesh;
	protected _fxStrength:number = 0.5;
	
	constructor(
		protected _camera:Camera
	) {
	
	}
	
	
	setMaterial(
		material:NodeMaterial
	){
		this._fxMaterial = material;
		if(this._sphere) this._sphere.material = material;
		if(this._isActive){
			this._sphere?.isEnabled(true);
			this.syncStrength();
		}
	}
	
	enabled(active:boolean):void{
		this._isActive = active;
		if(this._isActive){
			this.prepareSphere();
		}
		this._sphere?.isEnabled(Boolean(this._fxMaterial && this._isActive));
	}
	
	// Установить ситу эффекта
	setStrength(val:number){
		this._fxStrength = Scalar.Clamp(val, 0, 1);
		this.syncStrength();
	}
	
	protected syncStrength(){
		const block = this._fxMaterial?.getBlockByName('effectStrength');
		if(block){
			(block as InputBlock).value = this._fxStrength;
		}
	}
	
	protected prepareSphere():void{
		if(!this._sphere && this._camera && !this._camera.isDisposed()){
			this.createSphere();
			if(this._fxMaterial) {
				this._sphere!.material = this._fxMaterial;
			}
		}
	}
	
	protected createSphere(){
		this._sphere = MeshBuilder.CreateIcoSphere('borderVFXSphereMask', {
			radius:0.5,
			sideOrientation:Mesh.BACKSIDE,
		}, this._camera.getScene());
		this._sphere.position = this._camera.position.clone();
		this._sphere.setParent(this._camera);
	}
	
	dispose() {
		this._fxMaterial?.dispose();
		this._sphere?.dispose();
	}
}