import {JOINTS_LIST}            from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/JointsList';
import {Nullator}               from '@classes/Service/Features/Share/Nullator';
import {DoPause}                from '@classes/Service/Features/Share/DoPause';

import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import {Skeleton}               from '@babylonjs/core/Bones/skeleton';
import {Bone}                   from '@babylonjs/core/Bones/bone';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHand}              from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';

import {Subject}                from 'rxjs';
import {AbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/AbstractHandsMeshProcessor';
import type {IAnimationRecorder}    from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/IAnimationRecorder';
import type {TAnimationRecorderOptions, TAnimationRecorderSignal} from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TAnimationRecorderOptions';
import type {THandsAnimationData}   from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';
import type {TRecordMode}           from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/TRecordMode';

export class AnimationRecorder extends AbstractHandsMeshProcessor implements IAnimationRecorder {
	
	protected _helper:WebXRDefaultExperience;
	protected _handsList:XRHandedness[] = [];
	protected _record:THandsAnimationData;
	
	protected _signal$ = new Subject<TAnimationRecorderSignal>();
	
	protected _options:TAnimationRecorderOptions = {
		delayMS:1000
	};
	
	
	get signal$(){
		return this._signal$;
	};
	
	
	async init(
		helper:WebXRDefaultExperience,
		options?:TAnimationRecorderOptions
	){
		this._helper        =   helper;
		this._options       =   Object.assign(this._options, options);
		super.init(helper);
	}
	
	
	// Захватить анимацию рук
	async startRecord(
		durationInFrames:number,
		mode:TRecordMode,
		delayMS?:number
	):Promise<THandsAnimationData | undefined>{
		if(this.calcHandsListByRecordMode(mode)){
			// Заказана хотя бы одна рука
			
			// Сделать паузу
			await DoPause(delayMS || this._options?.delayMS || 1000);
			
			// Предупредить что стартуем
			this.sendSignal('START');
			
			// capturing
			await this.capture(durationInFrames);
			
			// Информируем о завершении
			this.sendSignal('FINISH');
			
			// Если захват прошёл
			return this.record;
		}
	}
	
	
	protected async capture(
							durationInFrames:number
	):Promise<void> {
		return new Promise<void>(
			(resolve)=>{
				
				// Стартовые позиции
				const startedHandsPositions:{
											right?:Vector3,
											left?:Vector3
				} = {};
				
				let framesObserver:Observer<XRFrame>;
				// Начинаем захваты
				
				let capturedFrames = 0;
				
				// Инициализация в начале захвата
				framesObserver = this._helper.baseExperience.sessionManager.onXRFrameObservable.add(()=>{
					if (this.handsReady(this._handsList)) {
						
						let success = true;
						this._handsList.forEach((hand:('right' | 'left'))=> {
							const xrHand            =   this._hands[hand];
							
							if(xrHand){
								const skeleton = xrHand.handMesh?.skeleton;
								if(skeleton){
									if(capturedFrames == 0){
										
										// Процесс первого кадра
										this.recordInit();
										this.initStartPositions(startedHandsPositions, skeleton, hand);
									}
									success = Boolean(success && this.processCaptureFrame(hand, xrHand, startedHandsPositions[hand]));
								}
							}
						});
						
						// Если позитивно, можно увеличивать счётчик захваченных кадров
						if(success) capturedFrames++;
						
						if (capturedFrames >= durationInFrames) {
							framesObserver.remove();
							resolve();
						}
					}
				});
			}
		);
	}
	
	
	// Capture positions in the first frame and set them as starting positions
	protected initStartPositions(
		startedPositions:{
							right?:Vector3,
							left?:Vector3
						},
		skeleton:Skeleton,
		hand:'left' | 'right'
	){
		let position = new Vector3();
		const wristIndex = skeleton.getBoneIndexByName('wrist_' + hand.substring(0, 1).toUpperCase());
		if(wristIndex != -1){
			const wristBone = skeleton.bones[wristIndex];
			if(wristBone){
				position = wristBone.getAbsolutePosition().clone();
			}
		}
		startedPositions[hand] = position;
	}
	
	
	// Every frame processing
	protected processCaptureFrame(
		hand:'right' | 'left',
		xrHand?:WebXRHand,
		startedHandPosition?:Vector3,
	){
		let result = false;
		
		if(xrHand && startedHandPosition){
			const skeleton  =   xrHand.handMesh?.skeleton;
			if(skeleton){
				// This is a strange implementation in the native Babylon feature. Let's load this map.
				//@ts-ignore
				const rigMap = WebXRHandTracking._GenerateDefaultHandMeshRigMapping(hand);
				
				let positionsFrameRecord:number[]   =   [];
				let quaternionsFrameRecord:number[] =   [];
				let boneName:string;
				let bone:Bone;
				let position:Vector3;
				let qt:Quaternion;
				
				// Iterate through all joints
				JOINTS_LIST.forEach((jName)=>{
					boneName                =   rigMap[jName];
					bone                    =   skeleton.bones[skeleton.getBoneIndexByName(boneName)];
					
					position                =   bone.position.subtract(startedHandPosition);
					qt                      =   bone.rotationQuaternion;
					positionsFrameRecord.push(Number(position.x.toFixed(3)), Number(position.y.toFixed(3)), Number(position.z.toFixed(3)));
					quaternionsFrameRecord.push(Number(qt.x.toFixed(3)), Number(qt.y.toFixed(3)), Number(qt.z.toFixed(3)), Number(qt.w.toFixed(3)) );
				});
				
				this.record[hand]!.push(positionsFrameRecord);
				(this.record[hand + 'Q' as keyof THandsAnimationData]! as number[][]).push(quaternionsFrameRecord);
				
				result = true;
			}
		}
		// console.log('Ehand', hand, startedHandPosition?.x,  startedHandPosition?.y,  startedHandPosition?.z);
		return result;
	}
	
	
	// Fill _handsList by RecordMode
	protected calcHandsListByRecordMode(mode:TRecordMode):boolean{
		this._handsList =   [];
		if((mode == 'right')  ||  (mode == 'both'))   this._handsList.push('right');
		if((mode == 'left')   ||  (mode == 'both'))   this._handsList.push('left');
		
		return Boolean(this._handsList.length);
	}
	
	
	// Resolve record
	protected get record():THandsAnimationData {
		if(!this._isDisposed && !this._record){
			this._record = {}
		}
		return this._record;
	}
	
	
	get isDisposed(){
		return this._isDisposed;
	}
	
	
	// Ensure records are made based on the list of hands
	protected recordInit(){
		this._handsList.forEach((hand:('right' | 'left'))=> {
			if (!this.record[hand]) {
				this.record[hand] = [];
				this.record[hand + 'Q' as ('leftQ' | 'rightQ')] = [];
			}
		});
	}
	
	protected sendSignal(signal:TAnimationRecorderSignal){
		this._signal$.next(signal);
	}
	
	dispose(){
		super.dispose();
		Nullator(this, 'keepByList', ['_isDisposed', 'isDisposed']);
	}
}