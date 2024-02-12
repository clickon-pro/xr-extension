import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Quaternion} from '@babylonjs/core/Maths/math.vector';
import type {TGesturePayload} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGesturePayload';


export type TXRCommand<K extends keyof TXRCommands = keyof TXRCommands> =
	{
		CMD:K,
		PLD:TXRCommands[K]
	};

/**
 * @obsolete
 */
export type TXRCommands = {
	// Служит для первоначальной установки
	// Для каждокадровых значений исполользуется USER_STATE feature
	SET_USER_STATE:{
		position:Vector3,
		orientation:Quaternion
	},
	GESTURE:{
		combinationName:string,
		combinationPayload?:TGesturePayload
	}
	// ...
};


