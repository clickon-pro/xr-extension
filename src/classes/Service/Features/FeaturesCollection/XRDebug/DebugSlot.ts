import {MeshBuilder}            from '@babylonjs/core/Meshes/meshBuilder';
import {Camera}                 from '@babylonjs/core/Cameras/camera';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {StandardMaterial}       from '@babylonjs/core/Materials/standardMaterial';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';

import type {Mesh}              from '@babylonjs/core/Meshes/mesh';
import type {Scene}             from '@babylonjs/core/scene';

import {AdvancedDynamicTexture} from '@babylonjs/gui/2D/advancedDynamicTexture';
import {TextBlock} from '@babylonjs/gui/2D/controls/textBlock';
import {Control} from '@babylonjs/gui/2D/controls/control';
import type {IDebugSlot} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugSlot';
import type {TSlotsDescription} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';


// Обслуживает панельку для текстового вывода
export class DebugSlot implements IDebugSlot {
	
	protected _plane:Mesh;
	protected _scene:Scene;
	protected _options:TSlotsDescription;
	protected _adv:AdvancedDynamicTexture;
	protected _slotName:string;
	protected _tBlock:TextBlock;
	
	
	async init(
		slotName:string,
		scene:Scene,
	    options:TSlotsDescription,
		camera:Camera | undefined
	){
		this._scene     =   scene;
		this._options   =   options;
		this._slotName  =   slotName;
		this.createPlane(camera);
	}
	
	
	protected createPlane(camera?:Camera){
		this._plane = MeshBuilder.CreatePlane('xr-debug-plane', {
			width:this._options.w,
			height:this._options.h,
			updatable:true
		}, this._scene);
		
		this.createMaterial();
		this.createTexture();
		
		if (camera){
			this._plane.setAbsolutePosition(camera.globalPosition.clone());
			this._plane.setParent(camera);
			this._plane.position.z = this._options.zDistance || 3;
			this._plane.position.x = this._options.offsetX || 0;
			this._plane.position.y = this._options.offsetY || 0;
		}
		
		this.createTextOut();
	}
	
	
	protected createMaterial(){
		const mat= new StandardMaterial('xr-debug-mat', this._scene);
		mat.alpha               =   0.5;
		mat.transparencyMode    =   StandardMaterial.MATERIAL_ALPHABLEND;
		mat.emissiveColor       =   new Color3(0,0,0);
		mat.backFaceCulling     =   false;
		if (this._plane) this._plane.material = mat;
	}
	
	
	// Создадим текстуру
	protected createTexture() {
		this._adv = new AdvancedDynamicTexture(
			'xr-debug-adv-' + this._slotName,
			this._options.txW,
			this._options.txH,
			this._scene,
			false,
			Texture.BILINEAR_SAMPLINGMODE,
		);
		
		((this._plane as Mesh).material as StandardMaterial).emissiveTexture    =   this._adv;
		((this._plane as Mesh).material as StandardMaterial).diffuseTexture     =   this._adv;
	}
	
	
	protected createTextOut(){
		this._tBlock                            =   new TextBlock();
		this._tBlock.text                       =   "";
		this._tBlock.top                        =   "4px";
		this._tBlock.left                       =   "16px";
		this._tBlock.width                      =   this._options.txW + 'px';
		this._tBlock.height                     =   this._options.txH + 'px';
		this._tBlock.color                      =   this._options.color                      ||  "white";
		
		let fontVal                       =   '36px';
		if (
			this._options.fontSize
			&& !isNaN(Number(this._options.fontSize))
		){
			fontVal                             =   Number(this._options.fontSize) + 'px';
		}
		this._tBlock.fontSize                   =   fontVal;
		
		
		let lineSpacing                   =   "6px";
		if (
			this._options.lineSpacing
			&& !isNaN(Number(this._options.lineSpacing))
		){
			lineSpacing                         =   Number(this._options.lineSpacing) + 'px';
		}
		this._tBlock.lineSpacing                =   lineSpacing;
		
		
		this._tBlock.textHorizontalAlignment    =   Control.HORIZONTAL_ALIGNMENT_LEFT;
		this._tBlock.textVerticalAlignment      =   Control.VERTICAL_ALIGNMENT_TOP;
		this._adv.addControl(this._tBlock);
	}
	
	
	print(text:string, addEmptyStringAtTheEnd?:boolean, solid?:boolean):void{
		// Продолжаем ли нет
		let str = this._tBlock.text
		if(solid){
			str = str + text;
		}else{
			str = str + '\n' + text;
			
			// сдвиг
			const regex = new RegExp("\\n(.*)", "g");
			const matches = str.match(regex);
			if (matches){
				const linesCount =  matches ? matches.length : 0;
				if (linesCount > this._options.lines){
					matches?.shift();
					str = '';
					matches.forEach(r=>{
						str += r;
					});
				}
			}
		}
		
		if (addEmptyStringAtTheEnd) str += '\n';
		this._tBlock.text = str;
	}
	
	
	dispose() {
		this._adv?.dispose();
		this._plane?.dispose(false, true);
	}
}