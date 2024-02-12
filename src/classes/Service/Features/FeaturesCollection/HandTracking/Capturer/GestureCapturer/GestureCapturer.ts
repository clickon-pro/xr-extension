import {AbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/AbstractHandsMeshProcessor';
import {Cases} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/TemplateBuilder/TemplateCases';

import {Observer}               from '@babylonjs/core/Misc/observable';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';

import {TemplateBuilder} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/TemplateBuilder/TemplateBuilder';
import {XRChecker} from '@classes/Service/XRChecker/XRChecker';
import type {IGestureCapturer}          from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/IGestureCapturer';
import type {TGestureTemplateNeo,	TJointsLink} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {IDebugXRFeature}           from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TGestureCapturerOption}    from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/GestureCapturer/TGestureCapturerOption';
import type {TLink}                     from '@classes/interfaces/TLink';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

export class GestureCapturer extends AbstractHandsMeshProcessor implements IGestureCapturer {
	
	protected _helper:WebXRDefaultExperience;
	protected _feature:WebXRHandTracking;
	
	protected _options:TGestureCapturerOption = {
		acquireEveryFrame:5,
		acquiresCount:100,
	};
	
	protected _accLinks:TJointsLink[][] = [];
	protected _debugFeature?:IDebugXRFeature;
	private _templateName:string;
	private _templateType:TGestureTemplateNeo['type'];
	private _links:TLink[] = [];
	
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
		// if (this._options.debugConfig && !this._options.debugConfig.isLoggerDeactivated) {
			this.logger.log('Gesture Capturer', 'info', 'init');
			this.logger.log(this._options, 'info', 'flat');
		// }
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
	
	async capture(
		name:string,
		// mode:'apple' | 'regular',
		gestureType:TGestureTemplateNeo['type'],
		links:TLink[],
		progressCallBack?:(progress:number)=>void
	): Promise<TGestureTemplateNeo> {
		this._templateName  =   name;
		this._templateType  =   gestureType;
		this._links         =   links;
		
		await this.doCapture(gestureType, progressCallBack);
		const deviceMode = await new XRChecker().deviceType();
		
		return new TemplateBuilder().summarize(
			this._templateName,
			this._templateType,
			deviceMode,
			this._accLinks,
		);
	}
	
	
	protected async doCapture(
		gestureType:TGestureTemplateNeo['type'],
		progressCallBack?:(progress:number)=>void
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
							this.acquireLinks();
							
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
	
	
	protected acquireLinks():void{
		// Запись одного прохода
		const tRecord:TJointsLink[] = [];
		
		this._links.forEach((link)=>{
			if (link.from.id && link.to.id) {
				let record: TJointsLink | undefined = {
					weight: link.weight,
					// рассчитывать min и max будем позже
					min: 0,
					max: 0,
					val: 0,
					from: {
						h: link.from.h.substring(0,1) as 'r' | 'l',
						id: link.from.id
					},
					to: {
						h: link.to.h.substring(0,1) as 'r' | 'l',
						id: link.to.id
					}
				};
				
				const handFrom = this._hands[(link.from.h == 'r') ? 'right' : 'left'];
				const handTo = this._hands[(link.to.h) == 'r' ? 'right' : 'left'];
				
				const j1 = handFrom?.getJointMesh(link.from.id as WebXRHandJoint);
				const j2 = handTo?.getJointMesh(link.to.id as WebXRHandJoint);
				
				if (j1 && j2){
					record.val = Vector3.Distance(j1.position, j2.position);
					tRecord.push(record);
				}
			}
		});
		
		this._accLinks.push(tRecord);
	}
	
	
	async dispose(){
		// TODO
	}
}