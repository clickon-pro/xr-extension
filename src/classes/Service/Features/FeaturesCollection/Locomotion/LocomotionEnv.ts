import {AbstractFeatureEnv} from '@classes/Service/Features/Share/AbstractFeatureEnv';

import {MeshBuilder}            from '@babylonjs/core/Meshes/meshBuilder';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import {WebXRWalkingLocomotion} from '@babylonjs/core/XR/features/WebXRWalkingLocomotion';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import type {IWebXRWalkingLocomotionOptions} from '@babylonjs/core/XR/features/WebXRWalkingLocomotion';
import type {ILocomotionXRFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Locomotion/interfaces/ILocomotionXRFeatureEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";
import {inject} from 'inversify';



export class LocomotionFeatureEnv extends AbstractFeatureEnv<WebXRWalkingLocomotion> implements ILocomotionXRFeatureEnv {
	
	protected _featureName:TXRFeatureNames     =   'LOCOMOTION';
	protected _nativeName                 =   WebXRFeatureName.WALKING_LOCOMOTION;
	protected _featureOptions:IWebXRWalkingLocomotionOptions;
	protected _helper:WebXRDefaultExperience;
	protected _locoTransform:TransformNode;
	protected _isInMotion:boolean = false;
	protected _observer:Observer<XRFrame>;
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	async init(
		helper: WebXRDefaultExperience,
		nativeOptions?: unknown,
		extendOptions?: unknown
	): Promise<void> {
		this._helper               =    helper;
		const scene         =   helper.baseExperience.sessionManager.scene;
		this._locoTransform        =   new TransformNode('locoNode', scene);
		
		const sp = MeshBuilder.CreateSphere('sp', {diameter:0.1}, scene);
		sp.setParent(this._locoTransform);
		this._locoTransform.position.y = 2.5;
		
		this._featureOptions = {
			// locomotionTarget:helper.baseExperience.camera.parent as TransformNode || helper.baseExperience.camera
			locomotionTarget:this._locoTransform
		}
		
		await super.init(helper, nativeOptions, extendOptions);
	}
	
	
	
	// TODO!!!!
	//  нативная фича имеет проблемы с детекцией остановки и начала
	//  ручек не имеет. Работает с низким FPS и предположительно задержка старта и остановки связана с буферизацией и
	//  низким FPS.
	//  Решение - или взять фичу за основу, разобрать, найти проблему, добавить ручки
	//  или записать 3D диаграмму положений центра шлема и посмотреть как такое детектировать в рантайм и сделать своё
	protected async whenFeatureAttached(): Promise<void> {
		
		this._observer = this._helper.baseExperience.sessionManager.onXRFrameObservable.add((xFrame:XRFrame)=>{
			// TODO порог движения настраиваемый?
			const distance = Vector3.Distance(this._locoTransform.position, Vector3.ZeroReadOnly);

			// Барьер выбирается в зависимости от того, движемся мы или нет
			const barrier = this._isInMotion ? 0.1 : 0.000001;
			
			if(distance > barrier){
				const direction = this._helper.baseExperience.camera.getForwardRay(1).direction;
				direction.y = 0;
				// TODO читать из опций
				const speed = 0.01;
				
				// !!! FIXME так не делать - есть navigator
				// this._helper.baseExperience.camera.position.addInPlace(direction.scale(speed));
				
				this._locoTransform.position = new Vector3();
				this._isInMotion = true;
			}else{
				this._isInMotion = false;
			}
		});
	}
	
	protected async whenFeatureDetached(): Promise<void> {
		this._observer?.remove();
		return super.whenFeatureDetached();
	}
	
	dispose() {
		this._observer?.remove();
		super.dispose();
	}
	
}