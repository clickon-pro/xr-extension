import {cloneDeep} from 'lodash';
import {HopMaterial} from '@classes/Service/Features/FeaturesCollection/Teleport/Resources/HopMaterial';
import {PlaceMaterial} from '@classes/Service/Features/FeaturesCollection/Teleport/Resources/PlaceMaterial';
import {NodeMaterialProvider} from '@classes/Service/Features/FeaturesCollection/Teleport/PlaceMaterial/PlaceMaterialProvider';

import {MeshBuilder}            from '@babylonjs/core/Meshes/meshBuilder';
import {Axis}                   from '@babylonjs/core/Maths/math.axis';
import {CreateGreasedLine}      from '@babylonjs/core/Meshes/Builders/greasedLineBuilder';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Curve3}                 from '@babylonjs/core/Maths/math.path';
import {GreasedLineRibbonMesh}  from '@babylonjs/core/Meshes/GreasedLine/greasedLineRibbonMesh';
import {GreasedLineRibbonPointsMode}    from '@babylonjs/core/Meshes/GreasedLine/greasedLineBaseMesh';
import type {Scene}             from '@babylonjs/core/scene';
import type {Mesh}              from '@babylonjs/core/Meshes/mesh';

import {PlaceMaterialApplicator} from '@classes/Service/Features/FeaturesCollection/Teleport/PlaceMaterial/PlaceMaterialApplicator';
import {HopMaterialApplicator} from '@classes/Service/Features/FeaturesCollection/Teleport/HopLineMaterial/HopMaterialApplicator';
import type {ITeleportDrawer} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportDrawer';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';
import type {INodeMaterialProvider} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/INodeMaterialProvider';
import type {IOptionsApplicator} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/IOptionsApplicator';


export class TeleportDrawer implements ITeleportDrawer {
	
	protected _hopMaterialProvider:INodeMaterialProvider<TTeleportDrawerOptions> = new NodeMaterialProvider();
	protected _hopOptionsApplicator:IOptionsApplicator = new HopMaterialApplicator();
	protected _placeMaterialProvider:INodeMaterialProvider<TTeleportDrawerOptions> = new NodeMaterialProvider();
	protected _placeOptionsApplicator:IOptionsApplicator = new PlaceMaterialApplicator();
	
	protected _options:TTeleportDrawerOptions = {
		hopLineOptions: {
			hopLineWidth: 0.025,
			
			animationSpeed:0.1,
			textureScaling:{x:80, y:1},
			bordersColorHex:'#f0f0f0',
			textureColorHex:'#e0e0e0'
		},
		placeOptions:{
			placeScaling: 1,
			placeOffset: 0.05,
			animationSpeed:0.5,
			textureScaling:{x:1, y:1},
			bordersColorHex:'#f0f0f0',
			textureColorHex:'#e0e0e0'
		}
	};
	protected _scene:Scene | undefined;
	protected _track:GreasedLineRibbonMesh | undefined;
	protected _disc:Mesh | undefined;
	
	async init(
		scene:Scene,
		options?:TTeleportDrawerOptions
	){
		this._scene     =   scene;
		this._options   =   Object.assign(this._options, options);
		await this._hopMaterialProvider.init(HopMaterial, scene, options);
		await this._placeMaterialProvider.init(PlaceMaterial, scene, options);
	}
	
	
	setOptions(
		options:TTeleportDrawerOptions
	){
		if(options.placeOptions){
			const material = this._placeMaterialProvider.material;
			if (material)   this._placeOptionsApplicator.applyOptions(options.placeOptions, material);
			
			if(options.placeOptions.visibility != undefined){
				this._options.placeOptions!.visibility = options.placeOptions.visibility;
			}
			
			if(options.placeOptions.placeScaling != undefined){
				this._options.placeOptions!.placeScaling = options.placeOptions.placeScaling;
			}
			
			if(options.placeOptions.animationSpeed != undefined){
				this._options.placeOptions!.animationSpeed = options.placeOptions.animationSpeed;
			}
			
			this.drawDisk();
		}
		
		if(options.hopLineOptions){
			const material = this._hopMaterialProvider.material;
			if (material)   this._hopOptionsApplicator.applyOptions(options.hopLineOptions, material);
		}
		this._options.placeOptions     =   Object.assign({}, this._options.placeOptions, options.placeOptions);
		this._options.hopLineOptions   =   Object.assign({}, this._options.hopLineOptions, options.hopLineOptions);
	}
	
	
	drawHopLine(
		pStart:Vector3,
		pAim:Vector3,
		pEnd:Vector3
	){
		const arc                =   Curve3.ArcThru3Points(pStart, pAim, pEnd, 30);
		const points            =   arc.getPoints();

		const pointsA           =   this.shiftPointsB(
																cloneDeep(points),
																-1 * (this._options.hopLineOptions?.hopLineWidth || 0.05) / 2,
																pStart, pEnd
		);
		const pointsB           =   this.shiftPointsB(
																cloneDeep(points),
																(this._options.hopLineOptions?.hopLineWidth || 0.05) / 2,
																pStart, pEnd
		);
		
		if(!this._track){
			this._track           =     CreateGreasedLine("teleport-track", {
				points: [pointsA, pointsB],
				ribbonOptions: {
					pointsMode: GreasedLineRibbonPointsMode.POINTS_MODE_PATHS,
					smoothShading: true
				},
				updatable:true,
			}) as GreasedLineRibbonMesh;
			
			// Назначение асинхронно
			const material    =    this._hopMaterialProvider.material;
			if (material){
				this._track.material     =   material;
				this._hopOptionsApplicator.applyOptions(this._options.hopLineOptions, material);
			}
		}else{
			const p1:number[] = [];
			const p2:number[] = [];
			pointsA.forEach((pointA)=>{
				p1.push(pointA.x, pointA.y, pointA.z);
			});
			pointsB.forEach((pointB)=>{
				p2.push(pointB.x, pointB.y, pointB.z);
			});
			this._track.setPoints([p1, p2]);
		}
	}
	
	
	private drawDisk(){
		this._disc?.dispose();
		this._disc              =   MeshBuilder.CreateDisc("teleport-disc", {radius:0.5}, this._scene);
		this._disc.rotation.x   =   Math.PI/2;
		this._disc.scaling.y    =   this._options.placeOptions?.placeScaling || 1;
		this._disc.scaling.x    =   this._options.placeOptions?.placeScaling || 1;
		this._disc.bakeCurrentTransformIntoVertices();
		
		const material          =   this._placeMaterialProvider.material;
		if(material){
			this._placeOptionsApplicator.applyOptions(this._options.placeOptions, material);
			this._disc.material = material;
		}
		
		this._disc.setEnabled(false);
	}
	
	
	drawTeleportPlace(
		pCenter:Vector3,
		normal?:Vector3 | null
	):void{
		if(!this._disc) this.drawDisk();
		
		if (this._disc){
			this._disc.setEnabled(true);
			this._disc.position     =   pCenter.clone();
			let nrm         =   normal || Axis.Y;
			
			// Поворот-ориентация по нормали
			const axis2     =   Vector3.Up();
			const axis3     =   Vector3.Up();
			const start             =   new Vector3(Math.PI / 2, Math.PI / 2, 0);	//camera.position
			Vector3.CrossToRef(start, nrm, axis2);
			Vector3.CrossToRef(axis2, nrm, axis3);
			const tmpVec = Vector3.RotationFromAxis(axis3.negate(), nrm, axis2);
			this._disc.rotationQuaternion = Quaternion.RotationYawPitchRoll(tmpVec.y, tmpVec.x, tmpVec.z);
			
			// Смещение по нормали
			this._disc.position.addInPlace(nrm.scale((this._options.placeOptions?.placeOffset || 0)));
		}
	}
	
	
	protected shiftPointsB(points:Vector3[], shift:number, start:Vector3, end:Vector3):Vector3[]{
		const normal = Vector3.Cross(end.subtract(start).normalize(), Vector3.Up()).normalize();
		normal.scaleInPlace(shift);
		points.forEach(pointA=>{
			pointA.addInPlace(normal)
		});
		return points;
	}

	
	disposeShapes(){
		this._disc?.dispose();
		this._track?.dispose();
		this._track = undefined;
		this._disc = undefined;
	}
}