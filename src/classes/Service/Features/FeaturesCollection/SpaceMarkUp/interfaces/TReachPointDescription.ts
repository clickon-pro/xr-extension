import type {IVector3Like} from '@babylonjs/core/Maths/math.like';

export type TReachPointDescription<K extends keyof TRestrictInfoMap = keyof TRestrictInfoMap> = {
	type:K,
	payload:TRestrictInfoMap[K]
};


export type TRestrictInfoMap = {
	'MOVE_IN_DANGER_ZONE':{
		lastCorrectPoint:IVector3Like,
		currentPoint:IVector3Like,
	},
	'EXIT_FROM_SAFE':{
		lastCorrectPoint:IVector3Like,
		currentPoint:IVector3Like,
	},
	'RETURN_IN_SAFE':{
		position:IVector3Like
	}
}

