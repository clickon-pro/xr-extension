import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {TGestureInformation,TGestureSemanticCoords} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';
import type {IMatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IMatchingResult';
import type {TSpaceBlockInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/SpaceLocator/TSpaceBlockInfo';

export interface ISPaceLocator {
	init(
		helper:WebXRDefaultExperience,
	):void;
	
	getLocation(matchedResult:IMatchingResult):TGestureInformation;
	
	getSidePosSemantic(pos:Vector3):TGestureSemanticCoords;
	convertCoordinatesFromGlobal(handKey:'r' | 'l'):Vector3;
	
	getSpaceBlockInfo(pos:Vector3):TSpaceBlockInfo;
	
	getBlockGeometryBySemantic(semantic:TGestureSemanticCoords):{
		center:Vector3,
		scaling:Vector3
	};
	
	dispose():void;
}