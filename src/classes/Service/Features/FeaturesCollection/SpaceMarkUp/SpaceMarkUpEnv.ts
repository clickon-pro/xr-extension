import {inject, injectable} from 'inversify';
import {Nullator} from '@classes/Service/Features/Share/Nullator';
import {AbstractFeatureEnv} from '@classes/Service/Features/Share/AbstractFeatureEnv';
import {Subscription} from 'rxjs';
import {MaskVFX} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/FX/Mask/MaskVFX';
import {FloorsKeeper} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/FloorsKeeper';
import {SpaceMarkUp} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/SpaceMarkUp';
import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {Constructor} from 'type-fest';
import type {ISpaceMarkUp} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/ISpaceMarkUp';
import type {ISpaceMarkUpEnv} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/ISpaceMarkUpEnv';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TSpaceMarkUpOptions} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TSpaceMarkUpOptions';
import {type AbstractMesh, NodeMaterial, Vector3, WebXRDefaultExperience} from '@babylonjs/core';
import type {TReachPointDescription, TRestrictInfoMap} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TReachPointDescription';
import type {FloorDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/TFloorDescription';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

@injectable()
export class SpaceMarkUpEnv extends AbstractFeatureEnv<ISpaceMarkUp> implements ISpaceMarkUpEnv {
	
	protected _featureName:TXRFeatureNames              =   'SPACE_MARKUP';
	protected _nativeName:string                        =   'xr-cl-space-mark-up';
	protected _nativeFeature:ISpaceMarkUp;
	protected _featureOptions:TSpaceMarkUpOptions       =   {};
	protected _subscriptionNativeInfo?:Subscription;
	
	// TODO могут появиться и другие типы эффектов
	protected _borderVFX?:MaskVFX;
	
	// !!! будет предоставлен фиче ниже по ссылке.
	// Репозиторий элементов разметки пространства (плоскостей)
	protected _floors = new FloorsKeeper();
	
	constructor(
		@inject('InfoKeeper')
		protected _infoKeeper:IKeepInfoAux,
		
		@inject('Navigator')
		protected _navigator:INavigateInSpaceAux,
		
		@inject ('Logger')
		protected logger:ILogger,
	) {
		super();
	}
	
	// !!! Должна быть обязательно для кастомных XR-фич
	protected _nativeConstructor:Constructor<ISpaceMarkUp> = SpaceMarkUp;
	
	
	async init(
		helper:WebXRDefaultExperience,
		nativeOptions?:TSpaceMarkUpOptions,
		extendOptions?:unknown,
	){
		await super.init(helper, Object.assign(this._featureOptions, nativeOptions));
		this._extendOptions = extendOptions;
		
		this._floors.init(helper.baseExperience.sessionManager.scene);
	}
	
	
	setRayLength(len:number):void{
		this._nativeFeature.setRayLength(len);
	}
	
	pause() {
		this._borderVFX?.setStrength(0);
		this._nativeFeature.pause();
	}
	
	
	run(){
		this._nativeFeature.run();
	}
	
	
	enableBorderVFX(active: boolean) {
		this.borderVFX.enabled(active);
	}
	
	
	protected get borderVFX(){
		if(!this._borderVFX){
			this._borderVFX = new MaskVFX(this._helper.baseExperience.camera);
		}
		return this._borderVFX;
	}
	
	
	setBorderVFXMaterial(
		material:NodeMaterial
	){
		this.borderVFX.setMaterial(material);
	}
	
	
	protected async whenFeatureAttached(): Promise<void> {
		this._nativeFeature.setHelper(this._helper);
		// this.prepareCrossBorderVFX();
		this._nativeFeature.setFloors(this._floors);
		this._nativeFeature.setInfoKeeper(this._infoKeeper);
		this._nativeFeature.setNavigator(this._navigator);
		
		this.listenBorders();
		return super.whenFeatureAttached();
	}
	
	
	protected listenBorders(){
		if(
			this._featureOptions.borderOffset
		){
			this._subscriptionNativeInfo?.unsubscribe();
			this._subscriptionNativeInfo        =   this._nativeFeature.borderInfo$.subscribe((bDesc:TReachPointDescription)=>{
				this._borderVFX?.setStrength(0);
				
				if (bDesc.type == 'EXIT_FROM_SAFE') {
					// this._beeper?.doBeep('crossBorder');
				}
				
				if (bDesc.type == 'MOVE_IN_DANGER_ZONE') {
					const payload = (bDesc.payload as TRestrictInfoMap['MOVE_IN_DANGER_ZONE']);
					const lastCorrectPoint = new Vector3(
						payload.lastCorrectPoint.x,
						payload.lastCorrectPoint.y,
						payload.lastCorrectPoint.z
					);
					
					let currentPoint = new Vector3(
						payload.currentPoint.x,
						payload.currentPoint.y,
						payload.currentPoint.z
					);
					
					const distance = Vector3.Distance(currentPoint, lastCorrectPoint);
					const strength = distance / this._featureOptions.borderOffset!;
					this._borderVFX?.setStrength(strength);
				}
			});
		}
	}
	
	
	addFloorsByMeshes(meshes:AbstractMesh[]){
		meshes.forEach((mesh)=>{
			this._floors.push({
				mesh:mesh
			});
		});
	}
	
	
	addFloors(meshes:FloorDescription[]){
		meshes.forEach((meshDesc)=>{
			this._floors.push(meshDesc);
		});
	}
	
	
	clearFloors():void{
		this._floors.clear();
	}
	
	dispose() {
		this._borderVFX?.dispose();
		this._subscriptionNativeInfo?.unsubscribe();
		super.dispose();
		Nullator(this);
	}
}