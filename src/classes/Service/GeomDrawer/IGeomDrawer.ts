import type {Scene}             from '@babylonjs/core/scene';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';

import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';

export interface IGeomDrawer {
	drawBlock(
		name:string,
		center:Vector3,
		scene:Scene,
		color?:string,
		linesWidth?:number
	):AbstractMesh;
	
	drawCross(
		name:string,
		center:Vector3,
		color:string,
		scene:Scene,
		linesWidth?:number,
		raySize?:number
	):TransformNode;
	
	
}