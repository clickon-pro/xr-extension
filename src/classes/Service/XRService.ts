import {Container, injectable}  from 'inversify';
import {QuaternionCorrector}    from '@classes/Service/Shared/QuaternionCorrector';

import {Camera}                 from '@babylonjs/core/Cameras/camera';
import type {Scene}             from '@babylonjs/core/scene';
import {Observer}               from '@babylonjs/core/Misc/observable';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import type {Nullable}          from '@babylonjs/core/types';
import {TargetCamera}           from '@babylonjs/core/Cameras/targetCamera';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {UniversalCamera}        from '@babylonjs/core/Cameras/universalCamera';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRInputSource}       from '@babylonjs/core/XR/webXRInputSource';
import {WebXRState}             from '@babylonjs/core/XR/webXRTypes';
import {XRChecker}              from '~/classes/Service/XRChecker/XRChecker';
import {HelperConfigBuilder}    from '~/classes/Service/HelperConfigBuilder/HelperConfigBuilder';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {Cleaner}                from '~/classes/Service/Cleaner/Cleaner';
import {FeatManager}            from '~/classes/Service/Features/FeatManager/FeatManager';
import {KeepInfoAux}            from '@classes/Service/Auxes/KeepInfoAux/KeepInfoAux';
import {NavigateInSpaceAux}     from '@classes/Service/Auxes/NavigateInSpaceAux/NavigateInSpaceAux';
import type {IXRService}        from '~/classes/Service/IXRService';
import type {IXRChecker, IXRCheckerPublic} from '~/classes/Service/XRChecker/IXRChecker';
import type {XRExtensionConfig} from '@classes/interfaces/XRExtensionConfig';
import type {TXRServiceOptions} from '@classes/interfaces/TXRServiceOptions';
import type {IXRFeatManager} from '~/classes/Service/Features/FeatManager/IXRFeatManager';
import type {TXRCommand, TXRCommands} from '@classes/interfaces/TXRCommand';
import type {IQuaternionLike, IVector3Like} from '@babylonjs/core/Maths/math.like';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TCamerasInfo} from '@classes/interfaces/TCamerasInfo';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TNameToInterfaceMapForFeatures} from '@classes/Service/Features/Share/interfaces/TNameToInterfaceMapForFeatures';
import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {IKeepInfoAux, IKeepInfoAuxInternal} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';
import type {INavigateInSpaceAux, INavigateInSpaceAuxInternal} from '@classes/Service/Auxes/NavigateInSpaceAux/INavigateInSpaceAux';
import {LoggerProvider} from '@classes/Service/Shared/LoggerProvider/LoggerProvider';
// import {HavokProvider} from '@classes/Service/Shared/__HavokProvider/HavokProvider';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";


// TODO функции для установки (перемещения root и камеры в любое место)

@injectable()
export class XRService implements IXRService {
	
	private _scene?: Scene;
	private _xrExtensionConfig!: XRExtensionConfig;
	private _helper?: WebXRDefaultExperience;
	
	// Важный элемент для работы. Вся XR кухня (начиная с камеры) должна привязываться к этому узлу
	// Например локомотион без него криво работает. Напрямую камеру НЕ ДВИГАЕМ!!!!
	private _xrRoot?:TransformNode;
	
	private _serviceOptions?: TXRServiceOptions;
	private _controllerAppearListener: Observer<WebXRInputSource>;

	// Потоки
	protected _xrState$: BehaviorSubject<WebXRState>            =   new BehaviorSubject<WebXRState>(WebXRState.NOT_IN_XR);
	protected _xrCommand$                   =   new Subject<TXRCommand>();
	protected _whenFeatureAttached$:Subject<IXRFeatEnv>         =   new Subject<IXRFeatEnv>();
	
	// Внутренний вотчер изменений стейта
	private _stateObserver?: Nullable<Observer<WebXRState>>;
	
	// Внутренний контейнер сервиса
	private _container:Container                                =   new Container({
		defaultScope:'Singleton',
	});
	
	protected _keepInfoAux:IKeepInfoAux & IKeepInfoAuxInternal;
	protected _navigatorAux:INavigateInSpaceAux & INavigateInSpaceAuxInternal;
	
	private readonly _xrChecker: IXRChecker;
	private _envFeatureManager: IXRFeatManager;
	private _envFeatureManagerFeatureAttached:Subscription;
	private _envFeatureManagerCmd:Subscription;
	
	private _oldActiveCamera?: Camera;
	
	// сохранить статус коллизий, которые были до XR режима
	private _collisionsStatus: boolean                          =   false;
	
	// Logger
	protected logger:ILogger;
	
	constructor() {
		this._xrChecker                                         =   this._container.resolve(XRChecker);
	}
	
	// Переключить на работу с другой сценой - вызвать init
	async init(
		scene: Scene,
		options?: TXRServiceOptions
	): Promise<void> {
		this._scene                 =   scene;
		this._xrRoot                =   this.resolveRoot;
		this._serviceOptions        =   options;
		
		// this.bindHavok();
		this.bindLogger();
		this.bindInfoKeeper();
		this.bindNavigator();
	}

	// protected bindHavok(){
	// 	Binding Havok
		// if(!this._container.isBound('__HavokProvider')) {
		// 	this._container.bind('__HavokProvider').to(__HavokProvider).inSingletonScope();
		// }
	// }
	
	
	// Привязка логгера или заглушки
	protected bindLogger(){
/*		const needRealLogger = ()=>{
			return Boolean(
				!this._serviceOptions?.debugConfig
				|| !this._serviceOptions?.debugConfig?.isLoggerDeactivated
			);
		}*/
		
		if(!this._container.isCurrentBound('Logger')) {
			this.logger = LoggerProvider();
			this._container.bind('Logger').toConstantValue(this.logger)
		}
		this.logger.log('XR SERVICE','info','init');
	}
	
	// Привяжем провайдера инфы
	protected bindInfoKeeper(){
		if(!this._container.isBound('InfoKeeper')) {
			this._container.bind('InfoKeeper').to(KeepInfoAux).inSingletonScope();
		}
		this._keepInfoAux   =   this._container.get<IKeepInfoAux & IKeepInfoAuxInternal>('InfoKeeper');
	}
	
	
	protected bindNavigator(){
		if(!this._container.isBound('Navigator')) {
			this._container.bind('Navigator').to(NavigateInSpaceAux).inSingletonScope();
		}
		this._navigatorAux   =   this._container.get<INavigateInSpaceAux & INavigateInSpaceAuxInternal>('Navigator');
	}
	
	
	get scene(){
		return this._scene;
	}
	
	get xrCommand$(): Observable<TXRCommand> {
		return this._xrCommand$ as Observable<TXRCommand>;
	}
	
	get helper(){
		return this._helper;
	}
	
	get infoKeeper(){
		return this._keepInfoAux as IKeepInfoAux;
	}
	
	get navigateInSpace(){
		return this._navigatorAux as INavigateInSpaceAux;
	}
	
	get currentXRStatus(){
		return this._helper?.baseExperience.state || WebXRState.NOT_IN_XR;
	}
	
	async isSupportImmersive(): Promise<boolean> {
		return Boolean(await this._xrChecker?.isSupported());
	}
	
	setConfig(config: XRExtensionConfig) {
		this._xrExtensionConfig = config;
	}
	
	get xrChecker():IXRCheckerPublic {
		return this._xrChecker;
	}
	
	get xrState$(): Observable<WebXRState> {
		return this._xrState$;
	}
	
	get whenFeatureAttached$():Observable<IXRFeatEnv>{
		return this._whenFeatureAttached$;
	}
	
	get xrRoot():TransformNode | undefined {
		return this.resolveRoot;
	}
	
	async exitFromXR(){
		if (this._helper?.baseExperience.state == WebXRState.IN_XR){
			await this._helper?.baseExperience.exitXRAsync();
		}
	}
	
	
	// TODO проверить, похоже это не особо нужный и работающий уже механизм
	protected get resolveRoot():TransformNode {
		if (!this._xrRoot) this._xrRoot = new TransformNode('xrRoot', this._scene);
		return this._xrRoot;
	}
	
	async activateXR(keepActiveCameraState?:boolean): Promise<boolean> {
		if(!this._helper || this._helper.baseExperience.state == WebXRState.NOT_IN_XR){
			return new Promise<boolean>(async (res) => {
				await this.createHelper();
				
				if (
					this._scene
					&& this._helper
				) {
					this.supplyRoot();
					
					this.addStateListener();
					
					// Сработает, когда \ если зайдём
					this._helper.baseExperience.sessionManager.onXRSessionInit.addOnce(async (sess) => {
						
						// Вывод имени устройства
						const devName = await this._xrChecker.deviceName();
						if (devName) this.debug?.print(this._serviceOptions?.debugConfig?.outSlotName || 'main', "DEVICE: " + devName, true);
					});
					
					this.activateXRSessionStartWatcher();
					
					const obs = this._helper.baseExperience.onStateChangedObservable.add(async (state)=>{
						
						const statsList:string[] = ['ENTERING_XR', 'EXITING_XR', 'IN_XR', 'NOT_IN_XR', 'UNKNOWN'];
						this.debug?.print(this._serviceOptions?.debugConfig?.outSlotName || 'main', 'XR Service STATE: ' + statsList[state]);
						
						if(state == WebXRState.IN_XR){
							this.activateXRSessionFramesWatcher();
							await this.afterEnterToXR();
							res(true);
							obs.remove();
						}
					});
					
					await this.resolveFeatureManager(this._helper);
					this.saveActiveCamera();
					this.correctCamera(keepActiveCameraState);
					
					await this._helper.baseExperience.enterXRAsync(this._serviceOptions?.mode || 'immersive-vr', "local-floor");
					
				} else {
					res(false);
				}
			});
		}else{
			return Promise.resolve(false);
		}
	}
	
	
	private saveActiveCamera(){
		if(this._scene) {
			this._oldActiveCamera = this._scene.activeCamera || this._scene.cameras[0];
		}
	}
	
	
	// Пытается сохранить ориентацию и положение от камеры, которая была активной до XR режима
	private correctCamera(keepActiveCameraState?:boolean){
		if(keepActiveCameraState && this._oldActiveCamera){
			const target = (this._oldActiveCamera as TargetCamera).target;
			
			this.navigateInSpace.navigate({
				actor:'XR_SERVICE',
				position:this._oldActiveCamera.position,
				orientation:this._oldActiveCamera.absoluteRotation,
				target: target,
				reason:'Correct position when entering. Copy from active camera'
			});
		}
	}
	
	
	protected async resolveFeatureManager(helper:WebXRDefaultExperience):Promise<void>{
		if(this._envFeatureManager){
			// На всякий случай. Так как не понятно как с фичами работает XR
			this.disposeFeatureManager();
		}
		
		this._envFeatureManager                     =   this._container.resolve(FeatManager);
		this._envFeatureManager.parentContainer     =   this._container;
		
		//пробросим событие выше
		// !! на надо возвращать поток феатмэнеджера, нужен свой, который будет стабилен вне зависимости
		// от смены менеджера
		this._envFeatureManagerFeatureAttached = this._envFeatureManager.whenFeatureAttached$.subscribe(
			(featureEnv)=>{
				this._whenFeatureAttached$.next(featureEnv);
			}
		);
		
		// Сконфигурируем фичи. Должно быть здесь, а не после входа!
		await this._envFeatureManager.init(
			helper,
			this._serviceOptions?.features
		);
		
		// Протранслируем команды от фич, если они хотят испускать такие команды
		this._envFeatureManagerCmd = this._envFeatureManager.xrCommandFromFeature$.subscribe((cmd)=>{
			this._xrCommand$.next(cmd);
		});
	}
	
	
	extractFeatureEnv<T extends TXRFeatureNames = TXRFeatureNames>
		(featureName:T):TNameToInterfaceMapForFeatures[T] | undefined{
			return this._envFeatureManager.getFeatureEnv(featureName) as TNameToInterfaceMapForFeatures[T];
	}
	
	
	removeFeature<T extends TXRFeatureNames = TXRFeatureNames>(featureName:T):undefined{
		this._envFeatureManager.removeFeature(featureName);
		
	}
	
	
	protected get debug():IDebugXRFeature | undefined{
		if (this._serviceOptions?.debugConfig){
			return this._helper!.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as IDebugXRFeature | undefined;
		}
	}
	
	
	get currentWebXRCameras():TCamerasInfo{
		return {
			camera:this._helper?.baseExperience.camera,
			left:this._helper?.baseExperience.camera.leftCamera as TargetCamera,
			right:this._helper?.baseExperience.camera.rightCamera as TargetCamera
		}
	}
	
	
	// Добавим отслеживание изменение стейта
	private addStateListener() {
		this._stateObserver?.remove();
		this._stateObserver = this._helper?.baseExperience.onStateChangedObservable.add((state) => {
			this._xrState$.next(state);
		});
	}
	
	
	protected async createHelper() {
		if (
			!this._helper
			&& this._scene
			&& await this.isSupportImmersive()
		) {
			// Создадим хэлпер с требуемыми опциями
			let helperConfigBuilder: HelperConfigBuilder | undefined = new HelperConfigBuilder();
			this._helper = await this._scene.createDefaultXRExperienceAsync(
				helperConfigBuilder.build(
					this._scene,
					this._serviceOptions,
					this._xrExtensionConfig
				)
			);
			helperConfigBuilder = undefined;
			
			this._navigatorAux.init(this._helper);
			// console.log('HELPER CREATED', this._helper);
		}
	}
	
	
	protected supplyRoot(){
		// Привяжем камеру к паренту
		this._helper!.baseExperience.camera.position    =   this.resolveRoot.getAbsolutePosition();
		this._helper!.baseExperience.camera.parent      =   this.resolveRoot;
	}
	
	
	protected async afterEnterToXR() {
		this.logger.log('ENTER TO IMMERSIVE', 'info', 'header5');
		this.activateXRSessionEndWatcher();
		this.sendStateCommand();
		this.activeColliding();
	}
	
	
	protected afterExitFromXR() {
		this.sendStateCommand();
		
		// Восстановим камеру
		this.restoreActiveCamera();
		
		this.deactivateColliding();
		
		// Отключим слушалку контроллеров
		this._controllerAppearListener?.remove();
		
		// Отключим фичи
		this.disposeFeatureManager();
		
		//TODO !!!! при переходе на 7.x, будет автоматически (проверить)
		//  https://forum.babylonjs.com/t/how-to-correctly-remove-skeletons-and-meshes-and-etc-after-exit-from-immersive-mode/48051
		new Cleaner().clean(this._helper!, this._scene!);
		this._helper = undefined;
	}

	
	private restoreActiveCamera(){
		if(this._oldActiveCamera && this._scene) {
			this._scene.activeCamera = this._oldActiveCamera;
		}
	}
	
	
	/**
	 * @obsolete
	 */
	public setCameraPosition(v3: IVector3Like): void {
		const camera = this._helper?.baseExperience.camera;
		if (camera) {
			camera.position.x   =   v3.x;
			camera.position.y   =   v3.y;
			camera.position.z   =   v3.z;
		}
	}
	
	
	/**
	 * @obsolete
	 */
	public setCameraOrientation(q:IQuaternionLike):void{
		const camera = this._helper?.baseExperience.camera;
		if (camera) {
			camera.rotationQuaternion = new Quaternion(q.x, q.y, q.z, q.w);
		}
	}
	
	
	// Следим за сигналом выхода из сессии
	protected activateXRSessionEndWatcher() {
		this._frameWatcher?.remove();
		this._sessionStartWatcher?.remove();
		
		if (this._helper) {
			// Следим за выходом
			this._helper.baseExperience.sessionManager.onXRSessionEnded.addOnce(() => {
				this.afterExitFromXR();
			});
		}
	}
	
	
	// Ожидаем появление сессии
	protected _sessionStartWatcher:Observer<XRSession>;
	protected activateXRSessionStartWatcher(){
		if(this._helper){
			this._sessionStartWatcher?.remove();
			this._sessionStartWatcher = this._helper.baseExperience.sessionManager.onXRSessionInit.addOnce((session) => {
				
				// Начало сессии
				session.requestReferenceSpace(('local-floor')).then((space)=>{
					this._keepInfoAux.setSpace(space);
				});
			});
		}
	}
	
	
	// Каждый фрейм. Установим позу
	protected _frameWatcher?:Observer<XRFrame>;
	protected activateXRSessionFramesWatcher(){
		if(this._helper){
			this._frameWatcher?.remove();
			// По непонятной причине сразу фреймы не начинают бежать (только один вызов происходит обсервера)
			setTimeout(()=>{
				this._frameWatcher = this._helper?.baseExperience.sessionManager.onXRFrameObservable.add(
					(xrFrame) => {
						const space = this._keepInfoAux.space;
						if(space){
							this._keepInfoAux.setPose(xrFrame.getViewerPose(space));
						}
					}
				);
			},100);
		}
	}
	
	
	protected sendStateCommand() {
		(this._xrCommand$ as Subject<TXRCommand<'SET_USER_STATE'>>).next(
			{
				CMD: 'SET_USER_STATE',
				// TODO проверить, похоже это не особо нужный и работающий уже механизм
				PLD: this.prepareStateCommandPayload()
			}
		);
	}
	
	
	protected prepareStateCommandPayload(): TXRCommands['SET_USER_STATE'] {
		const position = this._xrRoot?.getAbsolutePosition() || Vector3.ZeroReadOnly;
		// const position = this._helper?.baseExperience.camera.globalPosition || new Vector3();
		// TODO на root перейдём?
		const orientation = this._helper?.baseExperience.camera.rotationQuaternion || new Quaternion();
		return {
			position: position.clone(),
			orientation:QuaternionCorrector(orientation.clone())
		};
	}
	
	
	// TODO отдельная фича. Это заглушка
	// Активация коллайдинга
	protected activeColliding() {
		if (this._serviceOptions?.enableColliding) {
			this.copyEllipsoidFromOldCamera();
			
			if (this._scene) {
				this._scene.collisionsEnabled = true;
				this._collisionsStatus = this._scene?.collisionsEnabled;
			}
			
			if (this._helper) this._helper.baseExperience.camera.checkCollisions = true;
		}
	}
	
	
	// Отключение коллайдинга
	protected deactivateColliding() {
		if (
			this._serviceOptions?.enableColliding
			&& this._scene
		) {
			this._scene.collisionsEnabled = this._collisionsStatus;
		}
	}
	
	
	// Скопируем коллайдер с активной камеры и активируем коллайдинг
	protected copyEllipsoidFromOldCamera() {
		if (
			this._helper
			&& this._helper.baseExperience.camera
			&& this._oldActiveCamera as UniversalCamera
		) {
			this._helper.baseExperience.camera.ellipsoid = (this._oldActiveCamera as UniversalCamera).ellipsoid;
			this._helper.baseExperience.camera.ellipsoidOffset = (this._oldActiveCamera as UniversalCamera).ellipsoidOffset;
		}
	}
	
	
	protected disposeFlows(){
		this._xrCommand$?.unsubscribe();
		this._xrState$?.unsubscribe();
		this._whenFeatureAttached$?.unsubscribe();
	}
	
	
	protected disposeFeatureManager(){
		this._envFeatureManagerCmd?.unsubscribe();
		this._envFeatureManagerFeatureAttached?.unsubscribe();
		//@ts-ignore
		this._envFeatureManagerFeatureAttached = undefined;
		this._envFeatureManager.dispose();
		//@ts-ignore
		this._envFeatureManager = undefined;
	}
	
	dispose() {
		this._frameWatcher?.remove();
		this._sessionStartWatcher?.remove();
		
		this._navigatorAux.dispose();
		
		this.disposeFlows();
		this._stateObserver?.remove();
		
		this.disposeFeatureManager();

		this._helper?.dispose();
		this._helper = undefined;
		this._xrRoot?.dispose();
	}
}