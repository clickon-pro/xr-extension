import type {Scene}             from '@babylonjs/core/scene';
import type {Nullable}          from '@babylonjs/core/types';

import type {FloorDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/TFloorDescription';

export class FloorsKeeper {
	
	protected _scene: Scene;
	protected _floors: FloorDescription[] = [];
	
	
	init(scene:Scene){
		this._scene = scene;
	}
	
	
	clear(){
		this._floors = [];
	}
	
	
	get floors(){
		return this._floors;
	}
	
	// Уникальность определяется AbstractMesh
	push(item: FloorDescription){
		const i = this._floors.findIndex((desc)=>(desc.mesh == item.mesh));
		if(i == -1){
			// Новый
			this._floors.push(item);
		}else{
			// Замена
			this._floors[i] = item
		}
	}
	
	
	// TODO Кэшировать до измнения состава floors и сделать пересчёт кэш
	// Отдаст список возможных floor, ориентируясь на параметры lock или allowedFloors
	// переданного описателия флур
	getAllowedFor(desc?:Nullable<FloorDescription>):FloorDescription[]{
		// Доступен любой
		let ret:FloorDescription[] = this._floors;
		
		if(desc){
			const floorDesc = this._floors.find((fDesc)=>(fDesc.mesh == desc.mesh));
			if(floorDesc){
				// Выбираем по параметрам, описанным потребителем
				if(floorDesc.lock){
					// Только сам флур
					ret = [floorDesc];
				}else{
					// Список доступных floors
					if(floorDesc.allowList && floorDesc.allowList.length){
						ret = this._floors.filter((desc)=>{
							let isFind = false
							for(let m of floorDesc.allowList!){
								if(m == desc.mesh) {
									isFind = true;
									break;
								}
							}
							return isFind;
						});
						ret.push(floorDesc);
					}
				}
			}
		}
		return ret;
	}
}