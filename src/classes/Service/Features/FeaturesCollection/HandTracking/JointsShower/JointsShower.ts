import {CreateGreasedLine}      from '@babylonjs/core/Meshes/Builders/greasedLineBuilder';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';
import {StandardMaterial}       from '@babylonjs/core/Materials/standardMaterial';
import {GreasedLineMesh}        from '@babylonjs/core/Meshes/GreasedLine/greasedLineMesh';
import {GreasedLineMeshColorMode}       from '@babylonjs/core/Materials/GreasedLine/greasedLineMaterialInterfaces';
import {GreasedLineMeshMaterialType}    from '@babylonjs/core/Materials/GreasedLine/greasedLineMaterialInterfaces';
import type {Mesh}              from '@babylonjs/core/Meshes/mesh';
import type {Nullable}          from '@babylonjs/core/types';
import type {Scene}             from '@babylonjs/core/scene';

import type {IJointsShower}     from '@classes/Service/Features/FeaturesCollection/HandTracking/JointsShower/IJointsShower';
import type {TJointsLink}       from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';

export class JointsShower implements IJointsShower {

	protected _links:TJointsLink[]  =   [];
	protected _observer?:Observer<Nullable<Scene>>;
	protected _lines:Map<TJointsLink, GreasedLineMesh> = new Map();
	protected _spheres:Map<TJointsLink, Mesh> = new Map()
	
	constructor(
		protected _helper:WebXRDefaultExperience,
		protected _htFeature:WebXRHandTracking,
		links:TJointsLink[]
	) {
		this._links =   links;
	}
	
	setLinks(links: TJointsLink[]) {
		this._links =   links;
	}
	
	show(){
		const scene = this._helper.baseExperience.sessionManager.scene;
		this.prepareLines();
		// this.prepareSpheres();
		
		this._observer = scene.onBeforeRenderObservable.add(()=>{
			this._lines.forEach((line, link)=>{
				const fromHandName = (link.from.h == 'r') ? 'right' : 'left';
				const toHandName = (link.to.h == 'r') ? 'right' : 'left';
				const handFrom = this._htFeature.getHandByHandedness(fromHandName);
				const handTo = this._htFeature.getHandByHandedness(toHandName);
				
				const j1 = handFrom?.getJointMesh(link.from.id as WebXRHandJoint);
				const j2 = handTo?.getJointMesh(link.to.id as WebXRHandJoint);
				
				if (j1 && j2){
					const j1p = j1.absolutePosition;
					
					line.setPoints([
						[j1p.x, j1p.y, j1p.z,
						j2.absolutePosition.x, j2.absolutePosition.y, j2.absolutePosition.z]
					]);
					
					// Сферы
					const sphere = this._spheres.get(link);
					sphere?.setAbsolutePosition(j1p);
				}
			});
		});
	}
	
	hide(){
		this._observer?.remove();
		this.disposeLines();
		// this.disposeSpheres();
	}
	
	private static LineColors = {
		h:'#ff0000',
		n:'#FFBE00',
		l:'#00a000',
		ul:'#d4fd5f'
	};
	
	// Подготавливает линии
	protected prepareLines(){
		const scene = this._helper.baseExperience.sessionManager.scene;
		
		this._links.forEach(link => {
			const color = JointsShower.LineColors[link.weight];
			
			const line = CreateGreasedLine('line', {
				points:[0,0,0,0,0,0],
			}, {
				materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_SIMPLE,
				colorMode:GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
				color: Color3.FromHexString(color),
				width:0.0025,
			}, scene);
			
			this._lines.set(link, line as GreasedLineMesh);
		});
	}
	
	
	protected _spheresMaterial:StandardMaterial;
	/*prepareSpheres(){
		const scene = this._helper.baseExperience.sessionManager.scene;

		if (!this._spheresMaterial){
			this._spheresMaterial = new StandardMaterial('sp_material', scene);
			this._spheresMaterial.emissiveColor = new Color3(0, .9, 1);
			this._spheresMaterial.alpha = 0.4;
		}
		
		this._links.forEach(link => {
			const sphere = MeshBuilder.CreateGeodesic('jointSphere', {
				size:0.01
			}, scene);
			sphere.material = this._spheresMaterial;
			
			this._spheres.set(link, sphere);
		});
		
	}*/
	
	disposeLines(){
		this._lines.forEach((line)=>{
			line.dispose();
		});
		this._lines.clear();
	}
	
	/*disposeSpheres(){
		this._spheres.forEach((sp)=>{
			sp.dispose();
		})
		this._spheresMaterial?.dispose();
		this._spheres.clear();
	}*/
	
	dispose(){
		this.removeObserver();
		// this.disposeSpheres();
		this.disposeLines();
		//@ts-ignore
		this._links = undefined;
		//@ts-ignore
		this._lines = undefined;
		//@ts-ignore
		this._spheres = undefined;
	}
	
	private removeObserver(){
		this._observer?.remove();
		this._observer = undefined;
	}
}