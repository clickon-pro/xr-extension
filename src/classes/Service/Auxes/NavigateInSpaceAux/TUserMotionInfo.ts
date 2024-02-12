import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import type {TXRFeatureNames}   from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';

// Сохранит высоту камеры, использует только XZ, если указан position
export type TUserMotionInfo = {
	actor:'XR_USER' | 'FEATURE' | 'CONSUMER' | 'UNKNOWN' | 'XR_SERVICE';
	featureName?:TXRFeatureNames;
	reason?:string,
	oldValue:{
		position:Vector3,
		orientation:Quaternion
	},
	neoValue:{
		position:Vector3,
		orientation:Quaternion
	}
}

export type TUserNavigateOption = {
	position?: Vector3,
	
	// Saves the camera height, uses only XZ if position is provided
	keepHeight?:boolean,
	orientation?:Quaternion,
	target?: Vector3,
	actor?:TUserMotionInfo['actor'],
	featureName?:TXRFeatureNames,
	reason?:string,
}