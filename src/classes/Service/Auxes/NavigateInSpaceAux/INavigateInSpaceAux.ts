import {Observable}             from 'rxjs';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {TUserMotionInfo, TUserNavigateOption} from '@classes/Service/Auxes/NavigateInSpaceAux/TUserMotionInfo';

// AUX providing user navigation in space as well as
// information about position changes in space as a result of events
export interface INavigateInSpaceAux {
	
	readonly motion$:Observable<TUserMotionInfo>;
	
	readonly state:{
		position:Vector3,
		orientation:Quaternion
	};
	
	
	navigate(options:TUserNavigateOption):void;
	
	
	// Ориентирует пользователя по таргету
	setTarget(v3:Vector3):void;
}


export interface INavigateInSpaceAuxInternal {
	init(helper:WebXRDefaultExperience):void;
	dispose():void;
}