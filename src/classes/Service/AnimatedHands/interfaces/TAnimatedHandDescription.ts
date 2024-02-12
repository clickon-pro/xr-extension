import {Skeleton}               from '@babylonjs/core/Bones/skeleton';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';


export type TAnimatedHandDescription = {
	// May contain a skeleton within itself
	mesh?:AbstractMesh,
	// Can be assigned separately
	skeleton?:Skeleton,
	// Other TN nodes associated with bones should be attached to it
	bonesRoot?:TransformNode
}