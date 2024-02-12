import {injectable}             from 'inversify';
import {Observable, Subject}    from 'rxjs';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import type {INavigateInSpaceAux, INavigateInSpaceAuxInternal} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';
import type {TUserMotionInfo, TUserNavigateOption} from '@classes/Service/Auxes/NavigateInSpaceAux/TUserMotionInfo';


@injectable()
export class NavigateInSpaceAux implements INavigateInSpaceAux, INavigateInSpaceAuxInternal{

	protected _motion$ = new Subject<TUserMotionInfo>();
	protected _helper:WebXRDefaultExperience;
	
	init(
		helper:WebXRDefaultExperience
	) {
		this._helper    =   helper;
	}
	
	
	get motion$(){
		return this._motion$ as Observable<TUserMotionInfo>;
	}
	
	
	navigate(options:TUserNavigateOption):void{
		if(
			this._helper
			&& (options.position || options.orientation)
		){
			const info:Partial<TUserMotionInfo> = {
				actor:options.actor || 'UNKNOWN',
				reason:options.reason || 'unknown',
				featureName:options.featureName,
				oldValue:{
					position:this._helper.baseExperience.camera.position.clone(),
					orientation:this._helper.baseExperience.camera.rotationQuaternion.clone()
				}
			};
			
			if(options.position){
				this._helper.baseExperience.camera.position.x = options.position.x;
				this._helper.baseExperience.camera.position.z = options.position.z;
				if(!options.keepHeight){
					this._helper.baseExperience.camera.position.y = options.position.y;
				}
			}
			
			if(options.orientation){
				this._helper.baseExperience.camera.rotationQuaternion = options.orientation.clone();
			}
			
			if(options.target){
				this._helper.baseExperience.camera.setTarget(options.target.clone());
			}
			
			info.neoValue = {
				position:this._helper.baseExperience.camera.position.clone(),
				orientation:this._helper.baseExperience.camera.rotationQuaternion.clone()
			}
			
			this._motion$.next(info as TUserMotionInfo);
		}
	}

	
	setTarget(v3:Vector3){
		this._helper.baseExperience.camera.setTarget(v3);
	}
	
	
	get state(){
		return {
			position:this._helper.baseExperience.camera.position.clone(),
			orientation:this._helper.baseExperience.camera.rotationQuaternion.clone()
		}
	}
	
	dispose() {
		this._motion$.complete();
	}
}