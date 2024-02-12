import type {IQuaternionLike, IVector3Like} from '@babylonjs/core/Maths/math.like';

export type TXRUserState = {
	camera?:{
		position?:IVector3Like,
		orientation?:IQuaternionLike,
	},
	left?:{
		position?:IVector3Like,
		orientation?:IQuaternionLike,
	},
	right?:{
		position?:IVector3Like,
		orientation?:IQuaternionLike,
	},
	// ...
}