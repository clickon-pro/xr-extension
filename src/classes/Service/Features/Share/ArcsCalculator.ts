import type {IVector3Like}      from '@babylonjs/core/Maths/math.like';
import {Axis}                   from '@babylonjs/core/Maths/math.axis';
import {Ray}                    from '@babylonjs/core/Culling/ray';
import {PickingInfo}            from '@babylonjs/core/Collisions/pickingInfo';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {BoundingInfo}           from '@babylonjs/core/Culling/boundingInfo';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';

export class ArcsCalculator {
	
	track(
		time:number,
		pointStart:IVector3Like,
		pointAim:IVector3Like,
		velocity:number,
		gravity:number,
	):Vector3{
		
		const pStart    =   new Vector3(pointStart.x, pointStart.y, pointStart.z);
		// Так как входные параметры не относительны старта - надо выровнять точку направления
		// относительно стартовой
		const pAim      =   new Vector3(pointAim.x, pointAim.y, pointAim.z);
		
		// вектор направления
		const aim       =   pAim.subtract(pStart);
		
		const angleVertical = ():number =>{
			// проекция вектора направления на горизонтальную плоскость, проходящую через стартовую точку (Y)
			const pHoriz = new Vector3(pAim.x, pStart.y, pAim.z);
			const vHoriz = pHoriz.subtract(pStart);
			
			// нормаль плоскости
			const normalVertical = Vector3.Cross(aim, vHoriz).normalize();
			return Vector3.GetAngleBetweenVectors(aim, vHoriz, normalVertical);
		}
		
		const angleHorizontal = ():number =>{
			const prY0Aim   =   new Vector3(aim.x, 0, aim.z);
			
			return Vector3.GetAngleBetweenVectors(Axis.X, prY0Aim, Vector3.DownReadOnly);
		}
	
		const aV    =   angleVertical();
		const aH    =   angleHorizontal();
		
		const vcos  =   velocity * Math.cos(aV);
		
		const xt =  pointStart.x + (vcos * Math.cos(aH) * time);
		const zt =  pointStart.z + (vcos * Math.sin(aH) * time);
		const yt =  pointStart.y + (velocity * Math.sin(aV) * time) - (0.5 * gravity * time * time);
		
		return new Vector3(xt, yt, zt);
	}

	// Ищет точки пересечения с одним из указанных мешков.
	findCrossPoint(
		meshes:AbstractMesh[],
		startPoint:Vector3,
		aimPoint:Vector3,
		strength:number,
		gravity:number,
	):PickingInfo | undefined {
		const minY = (this.lowestY(meshes) || 0) - 1 ;
		
		const timeLimit = 10; // 10 секунд максимальная "дальность" рассчёта
		const step = strength * .1;
		let intersectInfo:PickingInfo | undefined;
		let lastPoint       =   aimPoint;
		for (let t=0; t < timeLimit; t = t + step){
			const point = this.track(t, startPoint, aimPoint, strength, gravity);
			// Здесь делённое на 2 (половина скорости) точно больше 0,1
			const ray = new Ray(lastPoint, point.subtract(lastPoint).normalize(), Vector3.Distance(lastPoint, point));
			
			const pickingInfos = ray.intersectsMeshes(meshes, false);
			
			lastPoint = point;
			if(pickingInfos.length > 0){
				// найдено пересечение
				let minLen = 10000000;
				pickingInfos.forEach(pickingInfo => {
					if(
						pickingInfo.hit
						&& (pickingInfo.distance < minLen)
					){
						intersectInfo = pickingInfo;
						minLen = pickingInfo.distance
					}
				});
				break;
			}
			
			// Мы ещё не нашли чего хотели, но мешков ниже уже и нет
			if (point.y < (minY || -1000000)) break;
		}
		// console.log(strength, lastPoint.y);
		return intersectInfo;
	}
	
	// Рассчитывает самую нижнюю координату Y в списке меш.
	protected lowestY(meshes:AbstractMesh[]):number | undefined {
		let cBoundingInfo:BoundingInfo;
		let minY = Infinity;
		meshes.forEach((m)=>{
			cBoundingInfo = m.getBoundingInfo();
			if(cBoundingInfo.boundingBox.minimumWorld.y < minY) minY = cBoundingInfo.boundingBox.minimumWorld.y;
		});
		return minY;
	}
}