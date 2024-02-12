import {Tools}                  from '@babylonjs/core/Misc/tools';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';

import {AcquireAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/AcquireAngles';
import {AbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/AbstractHandsMeshProcessor';
import {Cases} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/TemplateBuilder/TemplateCases';
import type {IWristCapturer} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/WristCapturer/IWristCapturer';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TGestureCapturerOption} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TGestureTemplateNeo, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

export class WristCapturer extends AbstractHandsMeshProcessor implements IWristCapturer {
	
	protected _debugFeature?:IDebugXRFeature;
	protected _wristAngles:TWristAngles[] = [];
	protected _helper:WebXRDefaultExperience;
	protected _feature:WebXRHandTracking;
	private   _templateType:TGestureTemplateNeo['type'];
	
	protected _options:TGestureCapturerOption = {
					acquireEveryFrame:5,
					acquiresCount:100,
	};
	
	
	constructor(
		protected logger:ILogger
	) {
		super();
	}
	
	
	async init(
		helper:WebXRDefaultExperience,
		feature:WebXRHandTracking,
		options?:TGestureCapturerOption,
	){
		this._helper = helper;
		this._feature = feature;
		this._options = Object.assign(this._options, options);
		this.logger.log('Gesture Capturer', 'info', 'init');
		this.logger.log(this._options, 'info', 'flat');
		super.init(helper);
		this.initDebuggerFeature();
	}
	
	
	setOptions(options:Partial<TGestureCapturerOption>){
		this._options = Object.assign(this._options, options);
	}
	
	
	protected initDebuggerFeature(){
		if (this._options?.debugConfig){
			this._debugFeature = this._helper.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as IDebugXRFeature | undefined;
		}
	}
	
	
	async doCaptureCycle(
		gestureType:TGestureTemplateNeo['type'],
		progressCallBack?: (progress: number) => void,
		betweenInitialPitchAndLimitPitch?:()=>Promise<void>,
		betweenLimitPitchAndInitialRoll?:()=>Promise<void>,
		betweenInitialRollAndLimitRoll?:()=>Promise<void>
	){
		this._debugFeature?.print(this._options.debugConfig?.outSlotName || 'main', 'WRIST ANGLES CAPTURE PHASE');

		const pitchInitial = await this.captureAngle('Pitch', gestureType, progressCallBack);
		this.printAngle(pitchInitial, 'pitch initial');
		
		// cb
		if(betweenInitialPitchAndLimitPitch)    await betweenInitialPitchAndLimitPitch();
		
		const pitchLimit = await this.captureAngle('Pitch', gestureType, progressCallBack);
		this.printAngle(pitchLimit, 'pitch limit');
		
		// cb
		if(betweenLimitPitchAndInitialRoll) await betweenLimitPitchAndInitialRoll();
		
		const rollInitial = await this.captureAngle('Roll', gestureType, progressCallBack);
		this.printAngle(rollInitial, 'roll initial');
		
		// cb
		if(betweenInitialRollAndLimitRoll) await betweenInitialRollAndLimitRoll();
		
		const rollLimit = await this.captureAngle('Roll', gestureType, progressCallBack);
		this.printAngle(rollLimit, 'roll limit');
		
		const ret:TWristDesc[] = [];
		['left', 'right'].forEach((direction:'left' | 'right') => {
			ret.push({
				hand:direction,
				useAnglesForDetection:true,
				initialPitch:pitchInitial[direction],
				limitPitch:pitchLimit[direction],
				initialRoll:rollInitial[direction],
				limitRoll:rollLimit[direction]
			} as TWristDesc);
		});
		return ret;
	}
	
	
	private printAngle(	angles:{right?: number, left?: number}, label:string){
		if (
			this._options.debugConfig
			&& this._debugFeature
			&& this._options.debugConfig.outSlotName
		){
			['right', 'left'].forEach( (i:'right' | 'left') => {
				let s = '';
				if (angles[i] != undefined){
					s = i.substring(0,1).toUpperCase() + ': ' + Tools.ToDegrees(angles[i] || 0).toFixed();
				}
				this._debugFeature?.print(
					this._options.debugConfig!.outSlotName!,
					'Captured angle:' + label + ' (deg): ' + s
				);
			});
		}
	}
	
	
	private printAngleToSlot(val:typeof this._wristAngles[number]){
		
		const m = new Map([
			[
				'left',
				[
					{
						debugOptionsKey:'pitchAngleSlotL',
						valueKey:'anglePitch',
						prefix:'pitch L:'
					},
					{
						debugOptionsKey:'rollAngleSlotL',
						valueKey:'angleRoll',
						prefix:'roll L:'
					}
				]
			],
			[
				'right',
				[
					{
						debugOptionsKey:'pitchAngleSlotR',
						valueKey:'anglePitch',
						prefix:'pitch R:'
					},
					{
						debugOptionsKey:'rollAngleSlotR',
						valueKey:'angleRoll',
						prefix:'roll R:'
					}
				]
			],
		])
		
		if (
			val &&
			this._options.debugConfig
			&& this._debugFeature
		){
			const rec= m.get(val.h);
			if (rec){
				rec.forEach((info)=>{
					this._debugFeature?.print(
						//@ts-ignore
						this._options.debugConfig[info.debugOptionsKey] || '',
						//@ts-ignore
						info.prefix + ' ' + Tools.ToDegrees(val[info.valueKey]).toFixed() || 0
					);
				})
			}
		}
	}
	
	
	// Захватывает и усредняет углы
	protected async captureAngle(
		axis:'Pitch' | 'Roll',
		gestureType: TGestureTemplateNeo['type'],
		progressCallBack?: (progress: number) => void
	):Promise<{right?:number, left?:number}> {
		const ret:{right?:number, left?:number} = {};
		this._templateType  =   gestureType;
		this._wristAngles = [];

		await this.doCapture(gestureType, progressCallBack);
		
		const handIndexes = Cases.get(this._templateType);
		handIndexes?.forEach((handIndex) => {
			
			const index = 'angle' + axis;
			let angle = 0;
			let count = 0;
			this._wristAngles.forEach((rec)=>{
				if(rec.h == handIndex){
					//@ts-ignore
					angle += rec[index] || 0;
					count++;
				}
			});
			
			if (count !== 0){
				ret[handIndex] = angle / count;
			}else{
				ret[handIndex] = undefined;
			}
		});
		return ret;
	}
	
	
	protected async doCapture(
		gestureType: TGestureTemplateNeo['type'],
		progressCallBack?:(progress:number)=>void,
	){
		return new Promise<void>((res)=>{
			let obsFr:Observer<XRFrame>;
			
			// Начинаем захваты
			let count:number = 0;
			let framesCount = 0;
			
			obsFr = this._helper.baseExperience.sessionManager.onXRFrameObservable.add(
				(x)=>{
					const hands = Cases.get(gestureType);
					if (hands && this.handsReady(hands)){
						framesCount++;
						if (framesCount > this._options!.acquireEveryFrame){
							framesCount = 0;
							
							// захват
							const handIndexes = Cases.get(this._templateType);
							this._wristAngles = this._wristAngles.concat(this.acquireWrists(handIndexes));
							if(this._wristAngles.length > 0) {
								this.printAngleToSlot(this._wristAngles[this._wristAngles.length - 1]);
							}
							
							count++;
							if (count >= this._options.acquiresCount){
								obsFr.remove();
								res();
							}else if (progressCallBack){
								progressCallBack(count / this._options.acquiresCount);
							}
						}
					}
				}
			);
		});
	}
	
	
	acquireWrists(indexes?:XRHandedness[]):TWristAngles[]{
		const handIndexes = indexes || ['right' , 'left'];
		const ret:TWristAngles[] = [];
		handIndexes?.forEach((hIndex:XRHandedness)=>{
			const hand          =   this._hands[hIndex as 'right' | 'left'];
			
			if(hand){
				const angles = AcquireAngles(hand, hIndex);
				if(angles) ret.push(angles);
			}
		});
		return ret;
	}
	
	
	async dispose(){
		super.dispose();
	}
}