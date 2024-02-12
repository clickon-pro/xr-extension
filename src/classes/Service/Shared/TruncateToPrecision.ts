import {Vector3}                from '@babylonjs/core/Maths/math.vector';

export const TruncateToPrecision = (num:number, precision:number):number=>{
	const factor = Math.pow(10, precision);
	return Math.trunc(num * factor) / factor;
}

export const TruncateVector = (vec3:Vector3, precision:number)=>{
	const factor = Math.pow(10, precision);
	const ret = new Vector3();
	['x','y','z'].forEach((axis:'x'|'y'|'z')=>{
		ret[axis] = Math.trunc(vec3[axis] * factor) / factor;
	});
	return ret;
}