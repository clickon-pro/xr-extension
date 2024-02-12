import {filter, Subscription} from 'rxjs';
import {TruncateVector} from '@classes/Service/Shared/TruncateToPrecision';

import {WebXRAbstractFeature} from '@babylonjs/core/XR/features/WebXRAbstractFeature';
import {BezierCurveEase}        from '@babylonjs/core/Animations/easing';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {PickingInfo}            from '@babylonjs/core/Collisions/pickingInfo';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';
import {Ray}                    from '@babylonjs/core/Culling/ray';
import type {Scene}             from '@babylonjs/core/scene';
import type {IPhysicsEnginePluginV2} from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import type {Nullable}          from '@babylonjs/core/types';

import {DebugSphere} from '@classes/Service/Features/Share/DebugSphere/DebugSphere';
import {FloorsKeeper} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/FloorsKeeper';
import {XZCorrector} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/XZCorrector';
import {SpaceMarkUpSender} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/Sender';
import type {ISpaceMarkUp} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/ISpaceMarkUp';
import type {IKeepInfoAux} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {FloorDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/Shared/FloorsKeeper/TFloorDescription';
import type {TSpaceMarkUpOptions} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TSpaceMarkUpOptions';
import type {INavigateInSpaceAux} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';


export class SpaceMarkUp extends WebXRAbstractFeature implements ISpaceMarkUp {
	
	protected   _helper:WebXRDefaultExperience;
	protected   _floorsKeeper:FloorsKeeper;
	protected   _rayLength:number = 10;
	
	// Последняя позиция, где хит ловился в корректных условиях
	protected   _lastStickyCameraPosition          =    new Vector3();
	
	// Последняя позиция в опасной зоне
	protected   _lastDangerZonePosition            =    new Vector3();
	// Мы в опасной зоне
	protected   _inDangerZone                      =    false;
	
	// Чтобы не вызывать случайные срабатывания до первого входа
	// Будет выставлен в false только при первом hit
	// Т.е. система не будет активирована, если старт будет с промахом
	// TODO подумать избавиться
	private     _firstEnter                        =    true;
	
	// Положение пересечения с флур при последнем удачном hit
	protected   _crossPoint:Nullable<Vector3>              =     new Vector3();
	// Нормаль пересечения с флур
	protected   _crossNormal:Nullable<Vector3>             =     new Vector3();
	
	// TODO проанализировать её необходимость
	protected   _prevFrameCrossPoint:Nullable<Vector3>     =     new Vector3();
	
	// состояние фичи
	protected   _isRun:boolean = false;
	
	// Активирован режим шага
	protected   _isStepMode:boolean =   false;
	
	// Скольжение по слопу
	// protected   _slopeMove:boolean  =   false;
	protected   _normalAngle:number =   0;
	
	// Корректор XZ
	protected   _correctorXZ:Nullable<XZCorrector>;
	
	// Хранилище флуро-элементов
	protected   _infoKeeper:IKeepInfoAux;
	protected   _navigator:INavigateInSpaceAux;
	
	protected   _stepDurationInFrames = 60;
	
	protected   _senderAUX = new SpaceMarkUpSender();
	
	// Описание последнего элемента, где был хит. Если хита не было, мы всё равно его сохраним
	protected   _lastFloorMeshDescriptor:Nullable<FloorDescription> = null;
	
	// отладочная сфера
	protected   _debugSphere:DebugSphere | undefined;
	
	
	constructor(
		manager:WebXRSessionManager,
		protected _options: TSpaceMarkUpOptions,
	) {
		super(manager);
		this._rayLength = this._options.defaultRayLength || 10;
		this.createDebugSphere();
	}
	
	
	// Проброс на AUX
	get borderInfo$(){  return this._senderAUX.borderInfo$;}
	get stairInfo$(){   return this._senderAUX.stairInfo$;}
	
	setRayLength(len:number):void{
		this._rayLength = len;
	}
	
	
	/**
	 * Code in this function will be executed on each xrFrame received from the browser.
	 * This function will not execute after the feature is detached.
	 * @param _xrFrame the current frame
	 */
	protected _onXRFrame(xrFrame: XRFrame): void {
		if (this.isFramePassAvailable){
			// Позиция шлема с коррекцией назад
			let crCamPos = this._correctorXZ!.getCorrectedCamPoint();
			// let crCamPos = this._helper.baseExperience.camera.position.clone();
			this.processFrame(crCamPos);
		}
	}
	
	
	// TODO + Havok как опциональная система для бросания лучей
	// Луч и результат пикинга
	private     _ray:Ray;
	private     _pickingInfo:PickingInfo;
	protected processFrame(pos:Vector3):boolean{
		
		// Отфильтруем возможные по конфигу
		const filteredFloorDescriptors = this._floorsKeeper.getAllowedFor(this._lastFloorMeshDescriptor);
		
		// Определение луча
		// const rayLen        =   this._floorsKeeper.currentLen + 2.5;
		this._ray                   =   new Ray(pos, Vector3.DownReadOnly, this._rayLength);
		
		// Результаты проверок
		let hit             =   false;
		let min:number              =   Infinity;
		let point           =   new Vector3();
		this._crossNormal           =   null;
		let hitFloorDesc:Nullable<FloorDescription> = null;
		
		// Перебираем флуры и ищем самый ближний по лучу из уже отфильтрованных
		for (let floorDesc of filteredFloorDescriptors){
			this._pickingInfo = this._ray.intersectsMesh(floorDesc.mesh, false, undefined, false, undefined, true);
			
			if(
				this._pickingInfo.hit
				// Отбираем САМЫЙ ближник к камере (самый высокий)
				&& (this._pickingInfo.distance < min)
			){
				min     =   this._pickingInfo.distance;
				hit     =   this._pickingInfo.hit;
				if(this.isDistanceLessThanMaxStep()){
					// Можно ступать (разница в высоте от пердыдущего фрейма, которую мы можем преодолеть)
					point                   =   this._pickingInfo.pickedPoint!;
					hitFloorDesc            =   floorDesc;
					this._crossNormal   =   this._pickingInfo.getNormal(true);
				}else{
					hit = false;
				}
			}
		}
		
		if(hit){
			// Сохраним флур, с которым у нас было взаимодействие
			this._lastFloorMeshDescriptor   =   hitFloorDesc;
			// Сохраним последнюю точку пересчения с флур
			this._crossPoint                =   TruncateVector(point.clone(), 3);
			this.hitPass(pos);
		}else{
			this._crossPoint                =   null;
			this._crossNormal               =   null;
			this.noHitPass(pos);
		}
		
		// Отладочная сфера
		(hit) ? this._debugSphere?.show() : this._debugSphere?.hide();
		this._debugSphere?.setPosition(point);
		
		return hit;
	}
	
	
	// Проход, если у нас есть под ногами флур
	protected hitPass(camPos:Vector3){
		// this._slopeMove     =   false;
		this._firstEnter    =   false;
		
		// Сохраним позицию
		this._lastStickyCameraPosition = camPos.clone();
		
		if(this._inDangerZone){ // мы были в опасной зоне до этого момента, а сейчас выход
			this._senderAUX.sendReturnInSafe(this._lastStickyCameraPosition);
			this._inDangerZone                  =   false;
		}else{
			// Здесь пока либо слоп либо лестница. TODO подумать надо ли чтобы одно исключало другое
			// В опасной зоне лестницы нет смысла это обрабатывать
			if(this.isNeedAndPossibleStartStepMode){
				this.activateStepMode();
			}else if (this.isNeedAndPossibleSlip()){
				this.stepInSLipMode();
			}
		}
		
		// Сохраним для следующих итераций обработки
		this._prevFrameCrossPoint = this._crossPoint?.clone() || null;
	}
	
	
	// Проход, если у нас под ногами ничего
	protected noHitPass(camPos:Vector3){
		// Промах
		if(!this._firstEnter) {
			// this._slopeMove     =   false;
			
			if(this._options.borderOffset){
				const distance              =   Vector3.Distance(
					new Vector3(camPos.x, 0, camPos.z),
					new Vector3(this._lastStickyCameraPosition.x, 0, this._lastStickyCameraPosition.z)
				);
				
				// Если дистанция меньше удаления от границы
				if(distance < this._options.borderOffset){
					this._lastDangerZonePosition = camPos;
					if(this._inDangerZone){
						this._senderAUX.sendMoveInDangerZone(this._lastStickyCameraPosition, this._lastDangerZonePosition);
					}else{
						this._senderAUX.sendExitFromSafe(this._lastStickyCameraPosition, this._lastDangerZonePosition);
						this._inDangerZone = true;
					}
				}else{
					this.correctPosition();
				}
			}else{
				this.correctPosition();
			}
		}
	}
	
	
	// Делать скатывание?
	protected isNeedAndPossibleSlip(){
		this._normalAngle = 0;
		if(this._lastFloorMeshDescriptor && this._lastFloorMeshDescriptor.isSlope && this._crossNormal){

			this._normalAngle   =   Math.abs(Vector3.GetAngleBetweenVectors(
				this._crossNormal,
				Vector3.UpReadOnly,
				Vector3.Cross(Vector3.UpReadOnly, this._crossNormal)
			));
			
			const crtA = (this._lastFloorMeshDescriptor!.criticalAngleDeg || 25) * 0.0175;
			
			// this.debug?.print('flow', this._normalAngle.toFixed(3) + '    ' + crtA.toFixed(3));
			
			// this._slopeMove = (this._normalAngle > crtA);
			return Boolean(this._normalAngle > crtA);
		}
		return false;
	}

	
	protected stepInSLipMode():void{
		const perp          =   Vector3.Cross(this._crossNormal!, Vector3.UpReadOnly);
		const dir           =   Vector3.Cross(perp, this._crossNormal!).normalize();
		
		// Сила скатывания зависит от угла нормали и гравитации
		const gravity       =   -9.8 / this._xrSessionManager.scene.getEngine().getFps();
		const k                     =   0.2; // что-то вроде коэффициента трения
		const slipStrength  =   this._normalAngle * gravity * k;
		
		dir.y                       =   0;
		const neoPos        =   this._crossPoint!.add(dir.scale(slipStrength));
		neoPos.y                    =   (this._infoKeeper.pose?.transform.position.y || 1.8)  + this._crossPoint!.y;
		
		if(Vector3.Distance(neoPos, this._helper.baseExperience.camera.position!) > 0.001) {
			this.moveUser(neoPos, 'movement in slip mode');
		}
	}
	
	
	// Переключение в режим шага
	// В этом режиме мы имитируем подъём на ступеньку
	protected _stepObserver:Observer<Scene>;
	// TODO бизье в настроки, как только это потребуется хотя бы 1 раз кому-нибудь
	//  Проверить характер:  https://cubic-bezier.com/#.28,1.32,.89,1.14
	protected _stepCurve       =   new BezierCurveEase(0.28,1.32,0.89,1.14);
	
	protected activateStepMode(){
		if(!this._isStepMode){
			this._isStepMode = true;
			
			// Стартовая точка
			const pointStart=   this._prevFrameCrossPoint!.clone();
			let stepTime    =   1;
			
			// Начался шаг
			this._senderAUX.sendStepStart(pointStart);
			
			// Текущая расчётная точка (Будет меняться)
			let point:Vector3     =   pointStart.clone();
			
			// сюда будем заносить разницу каждый фрейм
			let delta             =   new Vector3();
			
			const checkExit         = ():boolean =>{
				// Выходим, если нет пересечения
				return Boolean(
					this._crossPoint
					&& (stepTime < this._stepDurationInFrames)
					// ...
				);
			}
			
			this._stepObserver          =   this._xrSessionManager.scene.onBeforeRenderObservable.add(()=>{
				// выходы из режима
				if (!checkExit()){
					this._stepObserver.remove();
					this._isStepMode    =   false;
					this._senderAUX.sendStepEnd(this._crossPoint || this._prevFrameCrossPoint || new Vector3())
					return;
				}
				
				// нормализированное время
				const normTime  =   stepTime / this._stepDurationInFrames;
				delta                   =   this._crossPoint!.subtract(pointStart);
				
				const pt        =   this._stepCurve.ease(normTime);
				
				point.x                 =   delta.x + pointStart.x;
				const poseY     =    this._infoKeeper.pose?.transform.position.y || 1.8;
				
				point.y                 =   (pt * delta.y) + pointStart.y + poseY;
				point.z                 =   delta.z + pointStart.z;
				
				this.moveUser(point, 'movement in step mode')
				stepTime++;
			});
		}
	}
	
	
	// Перепад меньше максимально возможного
	protected isDistanceLessThanMaxStep():boolean{
		// Если предыдущего значения нет, считаем, что всё ок
		if(this._prevFrameCrossPoint == null)  return true;
		if(
			this._pickingInfo.pickedPoint
			&& (this._options.maxStepValue != undefined)
		){
			return Boolean(Math.abs(this._pickingInfo.pickedPoint.y - this._prevFrameCrossPoint.y) <= this._options.maxStepValue);
		}
		return true;
	}
	
	
	// Проверим на лестницы
	protected get isNeedAndPossibleStartStepMode():boolean{
		if(
			(this._crossPoint == null)
			|| (this._prevFrameCrossPoint == null)
		) return false;
		
		const delta = Math.abs(this._crossPoint!.y - this._prevFrameCrossPoint!.y);
		
		return Boolean( // перепад в пределах
			(delta > (this._options.minStepValue || 0.15))
			&& (delta < (this._options.maxStepValue || 0.5))
		);
	}
	
	
	// Корректирует позицию пользователя при выходе за зоны
	protected correctPosition(){
		let pos = this._lastStickyCameraPosition.clone();
		
		if(this._options.returnOffset){
			// Сделаем небольшой отступ, если у нас есть this._lastDangerZonePosition в противоположную сторону
			// Если при этом работает проверочный хит
			// x <---- | <-----o
			
			// Вектор направления от последней точки в опасной зоне до бордюра floor
			const dir = this._lastStickyCameraPosition.subtract(this._lastDangerZonePosition).normalize();
			dir.scaleInPlace(this._options.returnOffset);
			pos.addInPlace(dir);
			pos = this._lastStickyCameraPosition.clone();
		}
		
		this.moveUser(pos, 'correction of position');
	}
	
	
	run(){
		this._isRun = true;
	}
	
	
	pause() {
		this._senderAUX.sendReturnInSafe(this._lastStickyCameraPosition);
		this._firstEnter                    =   true;
		this._inDangerZone                  =   false;
		this._isRun = false;
	}

	
	// TODO
	protected getHavokPhysicEngine():Nullable<IPhysicsEnginePluginV2 | null>{
		const pE = this._xrSessionManager.scene.getPhysicsEngine();
		if (pE?.getPhysicsPluginName() == 'HavokPlugin') {
			return pE.getPhysicsPlugin() as IPhysicsEnginePluginV2;
		}
		return null;
	}
	
	
	// Спозиционировать пользователя с обратной коррекцией
	protected moveUser(pos:Vector3, reason?:string){
		if(pos && this._correctorXZ){
			this._navigator.navigate({
				position:this._correctorXZ.getReverseCorrection(pos),
				keepHeight:false,
				actor:'FEATURE',
				featureName:'SPACE_MARKUP',
				reason:reason
			});
		}
	}
	
	
	// Можно ли начинать обработку XRFrame
	protected get isFramePassAvailable():boolean{
		return Boolean(
			this._isRun
			&& this.attached
			&& this._helper
		);
	}
	

	// Создание отладочной сферы
	protected createDebugSphere(){
		if(this._options.debugConfig?.showDebugSphere) {
			this._debugSphere = new DebugSphere(this._xrSessionManager.scene, Color3.Red(), 'Restricted floor hit Sphere', 0.05, 0.9)
		}
	}
	
	
	// Устанавливает helper при присоединении фичи
	setHelper(helper:WebXRDefaultExperience){
		this._helper = helper;
		// this.getHavokPhysicEngine();
		this._correctorXZ = new XZCorrector(helper, this._options.realBodyXZCorrection);
	}
	
	
	// Только для чтения. Будет обновляться свыше в Env
	setFloors(floorsArray:FloorsKeeper){
		this._floorsKeeper = floorsArray;
	}
	
	
	// Установка данных
	setInfoKeeper(keeper:IKeepInfoAux):void{
		this._infoKeeper = keeper;
	}
	
	
	// Слушаем внешние перемещения и не вмешиваемся в них
	private _navigatorListener:Subscription;
	setNavigator(navigator:INavigateInSpaceAux){
		this._navigator = navigator;
		
		this._navigatorListener = this._navigator.motion$.pipe(
			filter((mot)=>{
				return (mot.featureName != 'SPACE_MARKUP');
			})
		).subscribe((motion)=>{
			// Здесь только сторонние перемещения.
			// Кто-то нас переместил. Надо отменить, что надо
			this._lastFloorMeshDescriptor   =   null;
			// this._slopeMove                 =   false;
			this._stepObserver?.remove();
			this._isStepMode                =   false;
			this._crossPoint                =   null;
			this._crossNormal               =   null;
			this._prevFrameCrossPoint       =   null;
		});
	}
	
	
	/*protected get debug():IDebugXRFeature | undefined{
		return this._helper.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as (IDebugXRFeature | undefined);
	}*/
	
	
	dispose() {
		this._debugSphere?.dispose();
		this._navigatorListener.unsubscribe();
		this._senderAUX.dispose();
		super.dispose();
	}
}