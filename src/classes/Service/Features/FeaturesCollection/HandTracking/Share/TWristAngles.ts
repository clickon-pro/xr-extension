import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import type {Nullable}          from '@babylonjs/core/types';

export type TWristAngles = {
	h:XRHandedness,
	anglePitch:number,
	angleRoll:number,
	qt:Nullable<Quaternion>
}