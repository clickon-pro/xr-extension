import {Observable} from 'rxjs';
import type {THandsAnimationData} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';
import type {TRecordMode} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TRecordMode';
import type {TAnimationRecorderSignal} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TAnimationRecorderOptions';


export interface IAnimationRecorder {
	
	// Информация о происходящем
	signal$:Observable<TAnimationRecorderSignal>;
	
	// Захватить анимацию рук
	startRecord(
		durationInFrames:number,
		mode:TRecordMode,
		delayMS?:number
	):Promise<THandsAnimationData | undefined>;
	
	readonly isDisposed:boolean;
	
	dispose(): void;
}