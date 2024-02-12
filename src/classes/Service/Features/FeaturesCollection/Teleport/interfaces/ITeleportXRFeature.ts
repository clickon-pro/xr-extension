import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {IVector3Like}      from '@babylonjs/core/Maths/math.like';
import type {IWebXRFeature}     from '@babylonjs/core/XR/webXRFeaturesManager';

import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';
import type {TTeleportFeatureOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TTeleportFeatureOptions';
import type {TAimPointDescription} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TAimPointDescription';
import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';

export interface ITeleportXRFeature extends IWebXRFeature {
	
	readonly status:string;
	
	init(
		helper:WebXRDefaultExperience
	):Promise<void>;
	
	setDrawerOptions(options:Partial<TTeleportDrawerOptions>):void;
	
	setOptions(options:Partial<TTeleportFeatureOptions>):void;
	
	stopAim():void;
	
	setInfoKeeper(keeper:IKeepInfoAux):void;
	setNavigate(navigator:INavigateInSpaceAux):void;
	
	drawAim(
		startPoint?:Vector3,
		aimPoint?:Vector3,
	):void;
	
	addFloor(mesh:AbstractMesh | AbstractMesh[]):void;
	clearFloors():void;
	removeFloor(mesh:AbstractMesh):void;
	
	setAimPoint(v3:IVector3Like):void;
	
	jump(
		startPoint?:Vector3,
		aimPoint?:Vector3
	):Promise<TAimPointDescription | undefined>;
	
	calculateJump(
		startPoint?:Vector3,
		aimPoint?:Vector3
	):Promise<TAimPointDescription | undefined>;
}