import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {TruncateVector}         from '@classes/Service/Shared/TruncateToPrecision';


// Коррекция назад
// Шлем на человеке немного выдаётся вперёд
// Относительно центра тяжести
// Коррекция немного уменьшает рассинхронизацию
// TODO!!! сделать эту штуку зависимой от устройства (где-то выше)
//  Тестировать на ступеньках
export class XZCorrector {
	
	protected static DEFAULT_REAL_BODY_XZ_CORRECTION    =   0.17;
	
	constructor(
		protected _helper:WebXRDefaultExperience,
		protected _correctionValue?:number
	) {
	}
	
	// Мы исходим из того, что устройство даёт позицию чуть более впереди, чем глаза
	// И тем более, чем стопы (подушечка стопы)
	//[VR-P1-DEVICE]HEAD
	//              body
	//              body
	//      foot-P2-foot
	// На псевдосхеме P1 - центр шлема, P2 - точка, для коррекции XZ
	// Попробуем сместить немного точку назад (к центру тяжести человека)
	public getCorrectedCamPoint():Vector3{
		const camPos=   this._helper.baseExperience.camera.globalPosition;
		const dir   =   this._helper.baseExperience.camera.getDirection(Vector3.RightHandedForwardReadOnly);
		// 15 см "назад"
		// !!! но нам надо не трогать Y
		const cc    =   camPos.add(dir.scale(this._correctionValue || XZCorrector.DEFAULT_REAL_BODY_XZ_CORRECTION));
		cc.y                =   camPos.y;
		return TruncateVector(cc ,3);
	}
	
	
	// Делает обратное преобразование в координаты камеры (устройства)
	public getReverseCorrection(pos:Vector3):Vector3{
		const dir = this._helper.baseExperience.camera.getDirection(Vector3.RightHandedForwardReadOnly).scale(
			-1 * (this._correctionValue || XZCorrector.DEFAULT_REAL_BODY_XZ_CORRECTION)
		);
		return TruncateVector(pos.add(new Vector3(dir.x, 0, dir.z)), 3);
	}
}