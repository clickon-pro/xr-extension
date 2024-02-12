import {isEqual, uniqWith} from 'lodash';
import {bordersX, bordersY, bordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/CombinationsPositions';

import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';
import {Matrix}                 from '@babylonjs/core/Maths/math.vector';

import {AbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/AbstractHandsMeshProcessor';
import type {ISPaceLocator} from '@classes/Service/Features/FeaturesCollection/HandTracking/SpaceLocator/ISPaceLocator';
import type {TGestureInformation, TGesturePosSemantic, TGesturePosSemanticByAxis, TGesturePosSemanticX, TGesturePosSemanticY, TGesturePosSemanticZ, TGestureSemanticCoords} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';
import type {TSpaceBlockInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/SpaceLocator/TSpaceBlockInfo';
import type {TBordersX, TBordersY, TBordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TBorders';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";
import type {IMatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IMatchingResult';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';


type TMM = {min:number, max:number};

// Обеспечивает работу с семантик-координатами
export class SpaceLocator extends AbstractHandsMeshProcessor implements ISPaceLocator{
	
	private invertMatrix = new Matrix();
	
	constructor(
		protected logger:ILogger,
		protected debugFeature?:IDebugXRFeature
	) {
		super();
		this.logger.log('SpaceLocator', 'info', 'add');
	}
	
	
	init(
		helper:WebXRDefaultExperience,
	){
		super.init(helper);
		this.logger.log('SpaceLocator', 'info', 'init');
	}

	
	// Получить позиционирование жеста
	getLocation(matchedResult:IMatchingResult):TGestureInformation{
		let ret:TGestureInformation = {
			templateName:matchedResult.templateName || '',
		};
		let crd:Vector3 = new Vector3();
		// TODO что там по геометрии у Эппла?
		
		matchedResult.hands.forEach((hKey)=>{
			crd = this.convertCoordinatesFromGlobal(hKey);
			const semanticCoords = this.getSidePosSemantic(crd);
			if (!ret[hKey]) ret[hKey] = {semantic:[]};
			ret[hKey]!.semantic.push(semanticCoords);
			ret[hKey]!.semantic = this.cleanSemantic(ret[hKey]!.semantic);
		});
		
		return ret;
	}
	
	
	// Фильтрует одинаковые записи
	protected cleanSemantic(semantic:TGestureSemanticCoords[]):TGestureSemanticCoords[]{
		return uniqWith(semantic, isEqual);
	}
	
	
	getSidePosSemantic(pos:Vector3):TGestureSemanticCoords{
		return {
			x:this.findBorderKey(pos, 'x', bordersX, 'XR4', 'XL4') as TGesturePosSemanticX,
			y:this.findBorderKey(pos, 'y', bordersY, 'YH3', 'YL5') as TGesturePosSemanticY,
			z:this.findBorderKey(pos, 'z', bordersZ, 'ZE', 'ZA') as TGesturePosSemanticZ
		};
	}
	
	
	private findBorderKey<AXIS extends 'x' | 'y' | 'z'>(
		pos:Vector3,
		axis:AXIS,
		data:{[key in TGesturePosSemanticByAxis<AXIS>]+?:{min:number, max:number}},
		maxIndex:TGesturePosSemanticByAxis<AXIS>,
		minIndex:TGesturePosSemanticByAxis<AXIS>,
	):TGesturePosSemantic{
		
		for (let bordersKey in data) {
			//@ts-ignore
			// this.debugFeature?.print('flow', 'D:' + bordersKey + pos[axis].toFixed(3) + ' ' + data[bordersKey].min.toString() + ' - ' + data[bordersKey].max.toString());
			if (
				//@ts-ignore
				(pos[axis] < data[bordersKey].max)
				//@ts-ignore
				&& (pos[axis] > data[bordersKey].min)
			){
				// this.debugFeature?.print('flow', 'ex here:' + bordersKey);
				return bordersKey as TGesturePosSemantic;
			}
		}
		// Пограничные случаи
		// TODO вывести тип по оси
		
		if (pos[axis] > data[maxIndex]!.max) {
			// this.debugFeature?.print('flow', '...' + pos.x + '.min.' + maxIndex);
			return maxIndex;
		}
		if (pos[axis] < data[minIndex]!.min) {
			// this.debugFeature?.print('flow', '...' + pos.x + '.max.' + minIndex);
			return minIndex;
		}
		// console.log(pos, axis, data);
		// debugger
		// Это никогда не может произойти!!!
		return 'ANY' as TGesturePosSemantic;
	}
	
	
	getBlockGeometryBySemantic(semantic:TGestureSemanticCoords):{
		center:Vector3,
		scaling:Vector3
	}{
		
		const center = new Vector3();
		const scaling = new Vector3(1,1,1);
		
		const pickMinMax = (
			axis:'x' | 'y' | 'z',
			minIndex:TGesturePosSemantic,
			maxIndex:TGesturePosSemantic,
			// semantic:TGestureSemanticCoords,
			source:TBordersX | TBordersY | TBordersZ
		)=>{
			const res = {min:0, max:0};
			
			const min = (source[minIndex as keyof typeof source] as TMM).min || 0;
			const max = (source[maxIndex as keyof typeof source] as TMM).max || 0;
			
			if (semantic[axis]  == 'ANY'){
				res.min    =   min;
				res.max    =   max;
			}else{
				// Частные случай x и стороны
				if (
					(axis == 'x')
					&&
					(
						(semantic[axis] == 'XR') || (semantic[axis] == 'XL')
					)
				){
					if (semantic[axis] == 'XR') {
						// Вся сторона правая
						res.min = ((source as TBordersX)['XC'].max);
						res.max = max;
					}else{
						// Вся сторона левая
						res.min = min;
						res.max = ((source as TBordersX)['XC'].min);
					}
				}else{
					// Общий случай
					res.min    =   (source[semantic[axis] as keyof typeof source] as TMM).min;
					res.max    =   (source[semantic[axis] as keyof typeof source] as TMM).max;
				}
			}
			
			center[axis]    =   (res.max + res.min) / 2;
			scaling[axis]   =   res.max - res.min;
			
			return res;
		};
		
		pickMinMax('x', 'XL4', 'XR4', bordersX);
		pickMinMax('y', 'YL5', 'YH3', bordersY);
		pickMinMax('z', 'ZA', 'ZE', bordersZ);
		
		return {
			center:center,
			scaling:scaling
		}
	};
	
	
	// Возвращает инфо по блоку, в котором координата
	getSpaceBlockInfo(pos:Vector3):TSpaceBlockInfo{
		const ret:TSpaceBlockInfo = {
			center:new Vector3(),
			size:new Vector3()
		};
		
		const pass = <AXIS extends 'x' | 'y' | 'z'>(
						axis:AXIS,
		                data:{[key in TGesturePosSemanticByAxis<AXIS>]+?:TMM},
						min:TGesturePosSemanticByAxis<AXIS>,
						max:TGesturePosSemanticByAxis<AXIS>
		)=>{
			const borderKey = this.findBorderKey(pos, axis, data, max, min) as TGesturePosSemanticByAxis<AXIS>;
			if (borderKey in data){
				ret.center[axis]    =   (data[borderKey]!.max + data[borderKey]!.min)/2;
				ret.size[axis]      =   Math.abs((data[borderKey]!.max - data[borderKey]!.min));
			}
		}
		
		pass('x', bordersX, 'XL4', 'XR4');
		pass('y', bordersY, 'YL5', 'YH3');
		pass('z', bordersZ, 'ZA', 'ZE');
		
		return ret;
	}
	
	
	public convertCoordinatesFromGlobal(handKey:'r' | 'l'):Vector3{
		const cam = this._helper.baseExperience.camera;
		// const camPos = this._helper.baseExperience.camera.position;

		const point = this.getHand(handKey)?.getJointMesh(WebXRHandJoint.WRIST).position || new Vector3();
		// console.log('>', this.getHand(handKey));
		return Vector3.TransformCoordinates(point, cam.getWorldMatrix().invertToRef(this.invertMatrix));
	}
	
	dispose() {
		this.logger.dispose('SpaceLocator');
		super.dispose();
	}
}