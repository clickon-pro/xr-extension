import type {TGestureMatchOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {TGestureCapturerOption} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TAnimationRecorderOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TAnimationRecorderOptions';

export type TExtendHandTrackingOptions = {
	// Начиная с этого расстояния между камерой и рукой будут прятаться мешки рук
	// debug?:boolean,
	distanceFromHideHandMeshes?:number,
	gestureRecognitionOptions?:TGestureMatchOptions,
	captureOptions?:TGestureCapturerOption,
	animationCaptureOptions?:TAnimationRecorderOptions,
	debugConfig?:{
		outSlotName:string
	}
};