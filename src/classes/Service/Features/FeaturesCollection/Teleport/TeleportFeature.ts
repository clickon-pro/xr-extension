import {isArray} from 'lodash';
import {Vector3}                from '@babylonjs/core/Maths/math.vector'
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';
import {WebXRAbstractFeature}   from '@babylonjs/core/XR/features/WebXRAbstractFeature';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {IVector3Like} from '@babylonjs/core/Maths/math.like';

import {TeleportDrawer} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TeleportDrawer';
import {ArcsCalculator} from '@classes/Service/Features/Share/ArcsCalculator';
import type {ITeleportXRFeature} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportXRFeature';
import type {TTeleportFeatureOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TTeleportFeatureOptions';
import type {ITeleportDrawer} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportDrawer';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';
import type {TAimPointDescription} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TAimPointDescription';
import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';


export class TeleportFeature extends WebXRAbstractFeature implements ITeleportXRFeature {
	
	protected _drawer:ITeleportDrawer;
	protected _options:TTeleportFeatureOptions;
	protected _calculator    =   new ArcsCalculator();
	protected _helper:WebXRDefaultExperience;
	protected _infoKeeper:IKeepInfoAux;
	protected _navigator:INavigateInSpaceAux;
	
	constructor(
		// TODO А зачем нам его бросать в конструктор, если у нас есть helper?!?!?!?!?!?!
		manager:WebXRSessionManager,
		options: TTeleportFeatureOptions
	) {
		super(manager);
		// console.log('OPTIONS TELEPORT', options);
		this._options = options;
		this._drawer    = new TeleportDrawer();
	}
	
	
	async init(
		helper:WebXRDefaultExperience
	){
		this._helper = helper;
		await this._drawer.init(
			this._xrSessionManager.scene,
			this._options.drawerOptions
		);
	}
	
	setInfoKeeper(keeper:IKeepInfoAux):void{
		this._infoKeeper = keeper;
	}
	
	setNavigate(navigator:INavigateInSpaceAux):void{
		this._navigator = navigator;
	}
	
	setOptions(options:Partial<TTeleportFeatureOptions>){
		this._options = Object.assign(this._options, options);
		if(options.drawerOptions)   this.setDrawerOptions(options.drawerOptions);
	}
	
	setDrawerOptions(options:Partial<TTeleportDrawerOptions>){
		this._drawer.setOptions(options);
	}
	
	
	protected _onXRFrame(_xrFrame: XRFrame): void {
	
	}
	
	
	get status():string{
		return '';
	}
	
	
	setAimPoint(v3: IVector3Like) {
	
	}
	
	
	addFloor(mesh:AbstractMesh | AbstractMesh[]):void {
		if (!this._options.floorMeshes) this._options.floorMeshes = [];
		
		if(isArray(mesh)){
			this._options.floorMeshes = this._options.floorMeshes.concat(mesh);
		}else{
			this._options.floorMeshes.push(mesh);
		}
	}
	
	
	clearFloors() {
		this._options.floorMeshes?.forEach((mesh)=>{
			this.removeFloor(mesh);
		});
	}
	
	
	removeFloor(mesh:AbstractMesh){
		const index = this._options.floorMeshes?.indexOf(mesh);
		if ( (index!=undefined) && index !== -1){
			this._options.floorMeshes?.splice(index, 1);
		}
	}
	
	
	stopAim(){
		this._drawer.disposeShapes();
	}
	
	
	// Активирует наведение (вектор строится между стартовой и наведенческой точкой
	drawAim(
		startPoint?:Vector3,
		aimPoint?:Vector3
	) {
		if (
			// this._options.floorMeshes?.length
			// &&
			startPoint
			&& aimPoint
		) {
			const endPoint = this.getEndPoint(startPoint, aimPoint);
			
			if (endPoint) {
				// трек
				this._drawer.drawHopLine(
					startPoint,
					aimPoint,
					endPoint.position
				);
				
				// место
				this._drawer.drawTeleportPlace(endPoint.position, endPoint.normal);
			}
		}
	}
	
	
	async jump(
		startPoint?:Vector3,
		aimPoint?:Vector3
	):Promise<TAimPointDescription | undefined>{
		const jPoint = await this.calculateJump(startPoint, aimPoint);
		// Установка для камеры
		if(jPoint) {
			this._navigator?.navigate({
				position:jPoint.position.clone(),
				actor:'FEATURE',
				featureName:'TELEPORT',
				reason:'Teleportation jump'
			});
			// this._helper.baseExperience.camera.position = jPoint.position.clone();
		}
		return jPoint;
	}
	
	
	// Вычисляет прыжок, но не соввершает его
	calculateJump(
		startPoint?:Vector3,
		aimPoint?:Vector3
	){
		return new Promise<TAimPointDescription | undefined>((resolve)=>{
			if(startPoint && aimPoint){
				const endPoint = this.getEndPoint(startPoint, aimPoint);
				if(endPoint && this._helper){
					
					const jumpPoint = endPoint.position.clone();
					jumpPoint.y = endPoint.position.y + (this._infoKeeper.pose?.transform.position.y || 0);
					
					endPoint.position.y = jumpPoint.y;
					resolve(endPoint);
					
				}else{
					resolve(undefined);
				}
			}else {
				resolve(undefined);
			}
		});
	}
	
	
	protected getEndPoint(
		startPoint:Vector3,
		aimPoint:Vector3
	):TAimPointDescription | undefined {
		if(this._options.floorMeshes?.length){
			const endPoint = this._calculator.findCrossPoint(
				this._options.floorMeshes,
				startPoint,
				aimPoint,
				this._options.strength || 5,
				this._options.gravity || 9.81
			);
			
			if(endPoint && endPoint.pickedPoint){
				return {
					position:endPoint.pickedPoint,
					normal:endPoint.getNormal(true) as Vector3,
					floorMesh:endPoint.pickedMesh,
					bu:endPoint.bu,
					bv:endPoint.bv
				};
			}
		}
	}
	
	
	// TODO кастомизация
	protected drawTarget(){
	
	}
}