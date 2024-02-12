import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {Color4}                 from '@babylonjs/core/Maths/math.color';
import {Material}               from '@babylonjs/core/Materials/material';
import {MeshBuilder}            from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial}       from '@babylonjs/core/Materials/standardMaterial';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import type {Scene}             from '@babylonjs/core/scene';

import type {TBordersX,	TBordersY,TBordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TBorders';
import type {IGeomDrawer} from '@classes/Service/GeomDrawer/IGeomDrawer';

export class GeomDrawer implements IGeomDrawer {
	
	
	
	drawBlock(
		name:string,
		center:Vector3,
		scene:Scene,
		color:string = '#808080FF',
		linesWidth:number = 0.025,
		alpha:number = 0.15
	):AbstractMesh{
		const block = MeshBuilder.CreateBox(name, {width:1, depth:1, height:1}, scene);
		
		// block.enableEdgesRendering();
		block.edgesColor = Color4.FromHexString(color);
		
		// console.log('block.edgesColor', block.edgesColor);
		block.edgesWidth = linesWidth;
		block.enableEdgesRendering();
		block.position = center;
		const m = new StandardMaterial('debug block material', scene);
		m.alpha = alpha;
		m.emissiveColor = Color3.FromHexString(color);
		block.material = m;
		return block;
	}
	
	
	
	drawCross(
		name:string,
		center:Vector3,
		color:string,
		scene:Scene,
		linesWidth:number = 0.05,
		raySize:number = 0.05
	):TransformNode{
		// TODO сделать нормально
		const tn = new TransformNode(name, scene);
		
		const axis = (axis:'x' | 'y' | 'z')=>{
			const box = this.drawBlock('name' + '_axis_' + axis, new Vector3(), scene, color, linesWidth);
			box.scaling = new Vector3(0.005, 0.005, 0.005);
			box.scaling[axis] = raySize;
			box.parent = tn;
		}
		
		axis('x');
		axis('y');
		axis('z');
		
		tn.position = center;
		return tn;
	}
	
	
	
	drawGrid(
		name:string,
		data:{
			x:TBordersX,
			y:TBordersY,
			z:TBordersZ,
		},
		scene:Scene,
		material:Material,
		color:string = '#808080ff',
		lineWidth:number = 0.005
	):TransformNode{
		const gridCenter  = new TransformNode(name, scene);

		for(let ix in data.x){
			for(let iy in data.y){
				for(let iz in data.z){
					const center    =   new Vector3(
						(data.x[ix as (keyof typeof data.x)]!.max + data.x[ix as (keyof typeof data.x)]!.min)/2,
						(data.y[iy as (keyof typeof data.y)]!.max + data.y[iy as (keyof typeof data.y)]!.min)/2,
						(data.z[iz as (keyof typeof data.z)]!.max + data.z[iz as (keyof typeof data.z)]!.min)/2,
					);
					const size = new Vector3(
						Math.abs((data.x[ix as (keyof typeof data.x)]!.max - data.x[ix as (keyof typeof data.x)]!.min)),
						Math.abs((data.y[iy as (keyof typeof data.y)]!.max - data.y[iy as (keyof typeof data.y)]!.min)),
						Math.abs((data.z[iz as (keyof typeof data.z)]!.max - data.z[iz as (keyof typeof data.z)]!.min)),
					);
					
					const block = this.drawBlock(
						'__xrGrid_'+ix+'__'+iy+'__'+iz,
						new Vector3(), scene, color, lineWidth
					);
					
					block.scaling = size;
					block.parent = gridCenter;
					block.position = center;
					block.material = material;
					block.enableEdgesRendering();
					block.edgesWidth = lineWidth;
				}
			}
		}
		return gridCenter;
	}
	
}