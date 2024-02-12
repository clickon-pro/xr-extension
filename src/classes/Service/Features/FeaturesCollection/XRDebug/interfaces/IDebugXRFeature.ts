import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {IWebXRFeature}     from '@babylonjs/core/XR/webXRFeaturesManager';

import type {TBordersX, TBordersY, TBordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TBorders';

export interface IDebugXRFeature extends IWebXRFeature {
	
	print(
			slotName:string,
			text:string,
			emptyStringAtTheEnd?:boolean,
			// продолжать строку
			solid?:boolean
	):void;
	
	// Разбить на установку размера отдельно
	drawBlock(
		center:Vector3,
		color:string,
		linesWidth?:number
	):AbstractMesh;
	
	drawCross(
		center:Vector3,
		color:string,
		linesWidth?:number
	):TransformNode;
	
	positionForBlock(
		pos:Vector3
	):void;
	
	deleteBlock():void;
	
	drawGrid(data:{x:TBordersX, y:TBordersY, z:TBordersZ}):void;
	
	removeGrid():void;
}