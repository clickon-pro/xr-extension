import {Quaternion}             from '@babylonjs/core/Maths/math.vector';

// Исправляет проблему с поворотом камеры
export const QuaternionCorrector = (q:Quaternion):Quaternion=>{
	const angles = q.toEulerAngles();
	return Quaternion.Identity().multiplyInPlace(Quaternion.RotationYawPitchRoll(angles.y + Math.PI, angles.x, 0))
}