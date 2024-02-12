import {GreasedLineRibbonMesh}  from '@babylonjs/core/Meshes/GreasedLine/greasedLineRibbonMesh';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import type {Scene}             from '@babylonjs/core/scene';

import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';

export interface ITeleportDrawer {
	init(
		scene:Scene,
		options?:TTeleportDrawerOptions
	):Promise<void>;

	setOptions(
		options:TTeleportDrawerOptions
	):void;

	drawHopLine(
		pStart:Vector3,
		pAim:Vector3,
		pEnd:Vector3,
		arcMesh?:GreasedLineRibbonMesh
	):void;
	
	drawTeleportPlace(
		pCenter:Vector3,
		normal?:Vector3 | null
	):void;
	
	disposeShapes():void;
}