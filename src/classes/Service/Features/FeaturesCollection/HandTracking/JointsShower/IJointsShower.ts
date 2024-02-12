import type {IDisposable} from '@babylonjs/core';
import type {TJointsLink} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';

export interface IJointsShower extends IDisposable {
	setLinks(links:TJointsLink[]):void;
	show():void;
	hide():void;
}