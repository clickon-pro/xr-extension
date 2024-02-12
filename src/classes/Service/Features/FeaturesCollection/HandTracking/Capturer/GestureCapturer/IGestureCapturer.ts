import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';

import type {TExtendHandTrackingOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/TExtendHandTrackingOptions';
import type {TGestureTemplateNeo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TGestureCapturerOption} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TLink} from '@classes/interfaces/TLink';


export interface IGestureCapturer {
	init(
		helper:WebXRDefaultExperience,
		feature:WebXRHandTracking,
		options:TExtendHandTrackingOptions['captureOptions'],
		// debug?:IXRDebugFeature
	):Promise<void>;
	
	setOptions(options:Partial<TGestureCapturerOption>):void;
	
	capture(
		name:string,
		// mode:'apple' | 'regular',
		gestureType:TGestureTemplateNeo['type'],
		links:TLink[],
		progressCallBack?:(progress:number)=>void,
	):Promise<TGestureTemplateNeo>;
	
	dispose():Promise<void>;
}