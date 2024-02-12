import {WebXRAbstractFeature} from '@babylonjs/core/XR/features/WebXRAbstractFeature';
import {AdvancedDynamicTexture} from '@babylonjs/gui';
import {GeomDrawer} from '@classes/Service/GeomDrawer/GeomDrawer';
import {DebugSlot} from '@classes/Service/Features/FeaturesCollection/XRDebug/DebugSlot';

import {Camera}                 from '@babylonjs/core/Cameras/camera';
import {StandardMaterial}       from '@babylonjs/core/Materials/standardMaterial';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';

import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TBordersX, TBordersY, TBordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TBorders';
import type {TDebugFeatureOptions} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';
import type {IDebugSlot} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugSlot';


export class XRDebugFeature extends WebXRAbstractFeature implements IDebugXRFeature {
	
	protected _block:AbstractMesh | undefined;
	protected _adv:AdvancedDynamicTexture;
	protected _gridPoint:TransformNode;
	protected _drawer = new GeomDrawer();
	protected _options:TDebugFeatureOptions;
	protected _slots = new Map<string, IDebugSlot>();
	
	constructor(
		manager:WebXRSessionManager,
		options: TDebugFeatureOptions,
	) {
		super(manager);
		this._options = options;
	}
	
	
	
	
	attach():boolean{
		this.createSlots();
		return super.attach();
	}
	
	
	detach(): boolean {
		this._slots.forEach(slot=>{
			slot.dispose();
		});
		return super.detach();
	}
	
	protected async createSlots() {
		for (let slotsKey in this._options.slots) {
			const slot = new DebugSlot()
			await slot.init(
							slotsKey,
							this._xrSessionManager.scene,
							this._options.slots[slotsKey],
							this.getCamera()
			);
			this._slots.set(slotsKey, slot);
		}
	}
	
	drawBlock(
		center:Vector3,
		color:string,
		linesWidth:number
	):AbstractMesh{
		this._block = this._drawer.drawBlock('debug-block',
			center, this._xrSessionManager.scene, color, linesWidth);
		return this._block;
	}
	
	
	drawCross(
		center:Vector3,
		color:string,
		linesWidth:number,
		raySize?:number
	):TransformNode{
		return this._drawer.drawCross('debug_cross',
			center, color, this._xrSessionManager.scene, linesWidth, raySize
		);
	}
	
	
	drawGrid(data:{
		x:TBordersX,
		y:TBordersY,
		z:TBordersZ
	}){
		const gridMat = new StandardMaterial('__xrGrid_mat', this._xrSessionManager.scene);
		gridMat.alpha = 0.0;
		
		const gridCenter = this._drawer.drawGrid(
			'debug_grid',
			data,
			this._xrSessionManager.scene,
			gridMat,
		'#3080ff',
			0.004
		);

		const camera = this.getCamera();
		gridCenter.parent = camera!;
		
		this._gridPoint = gridCenter;
	}
	
	
	removeGrid(){
		this._gridPoint?.dispose(false, true);
	}
	
	
	positionForBlock(pos:Vector3):void{
		if (this._block) this._block.position = pos;
	}
	
	deleteBlock():void{
		this._block?.material?.dispose();
		this._block?.dispose();
		this._block = undefined;
	}
	
	
	private getCamera():Camera | undefined{
		let camera:Camera | undefined = undefined;
		const scene = this._xrSessionManager.scene;
		for (let i = 0; i < scene.cameras.length; i++) {
			if(scene.cameras[i].getClassName() == 'WebXRCamera'){
				camera = scene.cameras[i];
				break;
			}
		}
		return camera;
	}
	
	
	/**
	 * Code in this function will be executed on each xrFrame received from the browser.
	 * This function will not execute after the feature is detached.
	 * @param _xrFrame the current frame
	 */
	protected _onXRFrame(xrFrame: XRFrame): void {
	
	}
	
	
	print(
		slotName:string,
		text:string,
		emptyStringAtTheEnd?:boolean,
		solid?:boolean
	):void{
		const slot = this._slots.get(slotName);
		if (slot){
			slot.print(text, emptyStringAtTheEnd, solid);
		}
	}
	
	
	
	
	dispose() {
		this.removeGrid();
		this._adv?.dispose();
	}
}