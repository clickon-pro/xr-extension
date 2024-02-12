/*
import {injectable} from 'inversify';
import HavokPhysics, {HavokPhysicsWithBindings} from '@babylonjs/havok';
import type {IHavokProvider} from '@classes/Service/Shared/__HavokProvider/IHavokProvider';
import {HavokPlugin, Nullable, PhysicsEngine, PhysicsEngineV2, Scene, Vector3} from '@babylonjs/core';



@injectable()
export class HavokProvider implements IHavokProvider {
	
	protected _havok:HavokPhysicsWithBindings;
	protected _physicsEngine:Nullable<PhysicsEngineV2 | PhysicsEngine>;
	
	async provideHavok() {
		if(!this._havok){
			this._havok =   await HavokPhysics();
		}
		return this._havok;
	}
	
	async providePlugin(scene:Scene, gravity?:Vector3):Promise<Nullable<PhysicsEngine | PhysicsEngineV2>>{
		const physicEngine      =   scene.getPhysicsEngine();
		if (!physicEngine){
			const hvPhysic      =   await this.provideHavok();
			const hvPlugin      =   new HavokPlugin(true, hvPhysic);
			const gravV3        =   gravity ? gravity : new Vector3(0, -9.8, 0);
			scene.enablePhysics(gravV3, hvPlugin);
		}
		return scene.getPhysicsEngine() as Nullable<PhysicsEngine>;
	}
	
}
 */