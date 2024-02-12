import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
// import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';

export type TJointDesc = {
	pos:Vector3,
	rot:Quaternion | null,
}

/*
export type TJointsDesc = {
	[fingerIndex in WebXRHandJoint]+?:TJointDesc
}*/
