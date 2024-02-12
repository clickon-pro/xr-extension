import {Vector3}                from '@babylonjs/core/Maths/math.vector';

export type TStepStairInfo = {
	[key in keyof TStepStairPayloads]:{
		type:key,
		payload:TStepStairPayloads[key]
	}
}[keyof TStepStairPayloads];

type TStepStairPayloads = {
	'STEP_BEGIN':{
		position:Vector3
	},
	// TODO? (например мимо флура когда) см. в этом случае checkExit в RestrictedFloor и окресности
	// 'STEP_CANCEL':{
	//
	// },
	'STEP_END':{
		position?:Vector3
	}
}