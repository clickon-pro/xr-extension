import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';

import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {ISpaceMarkUp} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/ISpaceMarkUp';
import type {FloorDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/TFloorDescription';



export interface ISpaceMarkUpEnv extends IXRFeatEnv<ISpaceMarkUp> {
	
	// Создаёт записи в конфигурации на базе мешей
	addFloorsByMeshes(
		meshes:AbstractMesh[],
		// Устанавливает спящий статус для этих мешей
		// inSleepingMode?:boolean
	):void;
	
	// Добавляет записи в конфигурацию
	addFloors(meshes:FloorDescription[]):void;
	
	// Запускает
	run():void;
	
	// Ставит на паузу
	pause():void;
	
	// Очищает конфигурацию
	clearFloors():void;
	
	// Включает \ выключает эффект для пересечения границ
	enableBorderVFX(active:boolean):void;

	// Устанавливает материал для эффекта пересечения
	setBorderVFXMaterial(material:NodeMaterial):void;
	
	setRayLength(len:number):void;
}
