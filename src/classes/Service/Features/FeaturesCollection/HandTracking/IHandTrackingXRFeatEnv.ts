import {Observable} from 'rxjs';

import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {IXRFeatEnv}        from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {ICombinationsRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsRepo/ICombinationsRepo';
import type {IGesturesRepo}     from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/IGesturesRepo';
import type {TGestureTemplateNeo, TJointsLink, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TGestureCapturerOption} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TGestureMatchOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {TLink} from '@classes/interfaces/TLink';
import type {TCombinationInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/ICombinationsProcessor';
import type {TJointAddress} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TJointAddress';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';
import type {THandsAnimationData} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';
import type {TRecordMode} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TRecordMode';

export interface IHandTrackingXRFeatEnv extends IXRFeatEnv<WebXRHandTracking> {
	
	readonly gesturesRepo:IGesturesRepo;
	readonly combinationsReposMap:Map<string, ICombinationsRepo>;
	readonly combinations$:Observable<TCombinationInfo>;
	
	startRecognize(combinationsRepoName?:string):void;
	stopRecognize(combinationsRepoName?:string):TFigureRecognizeReport | undefined;
	
	captureGestureTemplate(
		name:string,
		gestureType:TGestureTemplateNeo['type'],
		links:TLink[],
		progressCallBack?:(progress:number)=>void
	):Promise<TGestureTemplateNeo>;
	
	captureWristsAngles(
		gestureType:TGestureTemplateNeo['type'],
		// Если передан темплейт, то вристы будут добавлены в него
		template?:TGestureTemplateNeo,
		progressCallBack?:(progress:number)=>void,
		// Асинхронные функции между фазами цикла захвата вристов.
		// Если функции определены, то процесс будет останавливаться до разрешения промисов
		betweenInitialPitchAndLimitPitch?:()=>Promise<void>,
		betweenLimitPitchAndInitialRoll?:()=>Promise<void>,
		betweenInitialRollAndLimitRoll?:()=>Promise<void>
	):Promise<TWristDesc[]>;
	
	setCaptureOptions(options:Partial<TGestureCapturerOption>):void;
	setRecognizeOptions(options:Partial<TGestureMatchOptions>):void;
	
	getCurrentWristsPositions():{
		r:Vector3 | undefined,
		l:Vector3 | undefined
	}
	
	getCurrentWristsAngles():Promise<TWristAngles[]>;
	
	getJoints(hand:XRHandedness, jointsNames:WebXRHandJoint[]):{[key in WebXRHandJoint]+?:TransformNode};
	
	// Расстояние между джоинтами
	getDistanceBetweenJoints(
		joint1:TJointAddress,
		joint2:TJointAddress
	):number | undefined;
	
	// Возвращает меш джоинта
	getJointByAddress(joint:TJointAddress):AbstractMesh | undefined;
	
	// Захватывает анимацию рук
	captureHandsAnimation(
		frames:number,
		mode:TRecordMode,
		delayMS?:number
	):Promise<THandsAnimationData | undefined>;
	
	// Отображение линий joint
	createJointsShower(links:TJointsLink[]):void;
	showJoints():void;
	hideJoints():void;
	disposeJointsShower():void;
	
	// вернуть сохранённый отчёт по имени
	getSavedReportByName(reportName:string):TFigureRecognizeReport | undefined;
	
	// вернуть все отчёты
	getSavedReports():{[repName:string]:TFigureRecognizeReport};
}