// Отладочная сферка
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import type {Scene} from '@babylonjs/core/scene';
import type {Mesh} from '@babylonjs/core/Meshes/mesh';
import type {Nullable} from '@babylonjs/core/types';

export class DebugSphere {
	
	protected _sphere:Mesh;
	
	constructor(
		protected _scene:Scene,
		color?:Color3,
		name?:string,
		diameter?:number,
		visibility?:number
	) {
		this._sphere = MeshBuilder.CreateSphere(name || 'debug sphere', {diameter: diameter || 0.1}, this._scene);
		this._sphere.visibility = visibility || 1;
		const material = new StandardMaterial('debug sphere mat' + name, this._scene);
		material.diffuseColor = color || new Color3(0.9, 0.2, 0.2);
		this._sphere.material = material;
	}
	
	hide(){
		this._sphere.setEnabled(false);
	}
	
	show(){
		this._sphere.setEnabled(true);
	}
	
	// Позиционирование отладочной сферы (+ прячем \ показываем)
	setPosition(position:Nullable<Vector3>){
		if(position) this._sphere.position = position.clone();
	}
	
	dispose():void{
		this._sphere?.dispose(true, true);
	}
}