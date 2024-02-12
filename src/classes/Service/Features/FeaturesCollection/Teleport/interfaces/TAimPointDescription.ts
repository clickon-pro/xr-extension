import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {Nullable}          from '@babylonjs/core/types';

export type TAimPointDescription = {
	position:Vector3,
	normal:Vector3,
	floorMesh?:Nullable<AbstractMesh>,
	bu?:number,
	bv?:number
}