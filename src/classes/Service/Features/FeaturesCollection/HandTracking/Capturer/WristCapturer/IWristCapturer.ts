import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';

import type {TExtendHandTrackingOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/TExtendHandTrackingOptions';
import type {TGestureCapturerOption} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TGestureTemplateNeo, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';

export interface IWristCapturer {
	
	init(
		helper:WebXRDefaultExperience,
		feature:WebXRHandTracking,
		options:TExtendHandTrackingOptions['captureOptions'],
	):Promise<void>;
	
	setOptions(options:Partial<TGestureCapturerOption>):void;
	
	// Захватывает и усредняет углы
/*	captureAngle(
		axis:'Pitch' | 'Roll',
		// angleType:'initial' | 'limit',
		gestureType: TGestureTemplateNeo['type'],
		progressCallBack?: (progress: number) => void
	):Promise<{right?:number, left?:number}>;*/
	
	doCaptureCycle(
		gestureType:TGestureTemplateNeo['type'],
		progressCallBack?: (progress: number) => void,
		// Асинхронные функции между фазами цикла захвата вристов.
		// Если функции определены, то процесс будет останавливаться до разрешения промисов
		betweenInitialPitchAndLimitPitch?:()=>Promise<void>,
		betweenLimitPitchAndInitialRoll?:()=>Promise<void>,
		betweenInitialRollAndLimitRoll?:()=>Promise<void>
	):Promise<TWristDesc[]>;
	
	// значение углов в моменте
	acquireWrists():TWristAngles[];
	
	dispose():Promise<void>;
}