import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import {WebXRHand}              from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';

import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';

export const AcquireAngles = (hand:WebXRHand, hIndex:XRHandedness):TWristAngles | undefined => {
	const UP                    =   Vector3.Up();
	const wristJoint        =   hand.getJointMesh(WebXRHandJoint.WRIST);


	const rotateVector = (
		vector: Vector3,
		axis: Vector3,
		angle: number
	): Vector3 => {
		const rotationQuaternion = Quaternion.RotationAxis(axis, angle); // Customize the rotation angle as needed
		return vector.applyRotationQuaternionInPlace(rotationQuaternion).clone();
	}
	
		// Мы можем захватить только угол относительно оси, перпендикулярной плоскости пола
		// И угол скручивания руки по условной оси локоть-врист
		
	if(wristJoint){
		// const forwardVec    =   wristJoint.forward;
		
		// PITCH
		// const normal        =   Vector3.Cross(UP, wristJoint.forward);
		const anglePitch=   Vector3.GetAngleBetweenVectors(UP, wristJoint.forward, Vector3.Cross(UP, wristJoint.forward));
		
		// ROLL
		// Угол между up и UP определяется 2мя поворотами.
		// первая компонента определяется пичем (поворотом вокруг R), вторая (искомая) поворотом вокруг Fw
		
		// Возьмём итоговый угол
		// const upUp = Vector3.GetAngleBetweenVectors(UP, wristJoint.up, Vector3.Cross(UP, wristJoint.up));
		
		// Повернём up вокруг R на угол обратный pitch (за минусом 90, потому что питч считаем от вертикали)
		// В результате получим искомый вектор, из которого уже убрана pitch составляющая
		const rotatedVectorUp = rotateVector(
			wristJoint.up.normalize(),
			wristJoint.right.normalize(),
			(anglePitch - Math.PI/2) * -1
		);
		
		// Угол, определяющий поворот ролл, но без учёта знака
		let angleRoll = Vector3.GetAngleBetweenVectors(UP, rotatedVectorUp, Vector3.Cross(UP, rotatedVectorUp));
		
		// Знак определим за счёт того ниже или выше горизонтальной плоскости конец R
		const sideSign = Math.sign(
			wristJoint.getAbsolutePosition().y - wristJoint.right.add(wristJoint.getAbsolutePosition()).y
		);
		
		angleRoll *= sideSign;

		// Преобразуем ролл
		// Исходная
		//                  90
		//                  |
		//                  |
		// 0                |               180
		// =====================================
		// -0               |              -180
		//                  |
		//                  |
		//                -90
		
		// Результирующая
		//                  90
		//                  |
		//                  |
		// 0                |               180
		// =====================================
		// 360              |               180
		//                  |
		//                  |
		//                 270
		
		if(angleRoll < 0){
			angleRoll = Math.PI + (Math.PI - Math.abs(angleRoll));
		}
		
		// довернём под левую руку
		if(hIndex == 'left'){
			angleRoll = Math.abs(angleRoll - (Math.PI * 2));
		}
		
		return {
			h:hIndex,
			anglePitch,
			angleRoll,
			qt:wristJoint.rotationQuaternion
			
			//@ts-ignore
			// up:upUp
		};
	}
}