import {injectable} from 'inversify';
import {Observable, Subject, take}  from 'rxjs';
import {WebXRFeatureName}           from '@babylonjs/core/XR/webXRFeaturesManager';
import {WebXRSessionManager}        from '@babylonjs/core/XR/webXRSessionManager';
import {WebXRDefaultExperience}     from '@babylonjs/core/XR/webXRDefaultExperience';
import {Observer}                   from '@babylonjs/core/Misc/observable';
import {WebXRFeaturesManager}       from '@babylonjs/core/XR/webXRFeaturesManager';
import type {IWebXRFeature}         from '@babylonjs/core/XR/webXRFeaturesManager';
import type {IXRFeatEnv}            from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TXRFeatureNames}       from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {Constructor}           from 'type-fest';
import type {ILogger}               from "@classes/Service/Shared/LoggerProvider/ILogger";
import type {TXRCommand}            from '@classes/interfaces/TXRCommand';


@injectable()
export abstract class AbstractFeatureEnv<NATIVE_FEAT extends IWebXRFeature = IWebXRFeature> implements IXRFeatEnv {
	
	protected   _featureOptions:unknown = {};
	protected   _extendOptions:unknown = {};
	protected   _nativeFeature:NATIVE_FEAT;
	protected   _helper:WebXRDefaultExperience;
	protected   _isSupport:boolean;
	protected   _attachListener:Observer<IWebXRFeature>;
	protected   _detachListener:Observer<IWebXRFeature>;
	protected   _featureAttached:boolean           =   false;
	// Изначально также выставлена в тру
	protected   _featureDetached:boolean           =   true;
	protected   _featureAttached$     =   new Subject<void>();
	protected   _featureDetached$     =   new Subject<void>();
	protected   _cmdFlow$:Subject<TXRCommand> | undefined;
	
	protected   logger?:ILogger;
	
	// будет переопределяться
	protected   _featureName:TXRFeatureNames;
	
	// ДОЛЖНО БЫТЬ ОБЯЗАТЕЛЬНО
	protected   _nativeName:WebXRFeatureName | TXRFeatureNames;
	
	// переопределяться. Нужен только для кастомных фич
	protected   _nativeConstructor:Constructor<NATIVE_FEAT>;
	
	protected   _options:unknown;
	
	
	get nativeName():WebXRFeatureName | TXRFeatureNames{
		return this._nativeName;
	}
	
	// Исходиящий поток комманд, который вольётся в исходящий поток всего XR Service
	// !!! ЕСЛИ фича подразумевает такой поток - создать не позже конструктора
	get cmdFlow$(): Observable<TXRCommand> | undefined {
		return this._cmdFlow$ as Observable<TXRCommand>;
	}
	
	async init(
		helper:WebXRDefaultExperience,
		nativeOptions?:unknown,
		extendOptions?:unknown,
	){
		this.logger?.log(this._featureName, 'info', 'init');

		// МОЖЕТ БЫТЬ ВЫЗВАН НЕОДНОКРАТНО!
		this._helper            =   helper;
		this._featureOptions    =   Object.assign(this._featureOptions as object, nativeOptions);
		this._extendOptions     =   Object.assign(this._extendOptions as object, extendOptions);
		this.addCustomFeature();
		this.enableFeature();
	}
	
	get featureName(){
		return this._featureName;
	}
	
	setFeatureName(name:TXRFeatureNames){
		this._featureName = name;
	}
	
	// Для проверки присоединения
	whenAttached(): Promise<void> {
		return new Promise<void>((res)=>{
			if (this._featureAttached) res();
			this._featureAttached$.pipe(take(1)).subscribe(()=>{
				res();
			});
		});
	}
	
	
	// Для проверки отсоединения
	whenDetached():Promise<void> {
		return new Promise<void>((res)=>{
			if(this._featureDetached) res();
			this._featureDetached$.pipe(take(1)).subscribe(()=>{
				res();
			});
		});
	}
	
	get isSupport():boolean{
		return this._isSupport;
	}
	
	protected get featuresManager():WebXRFeaturesManager{
		return this._helper!.baseExperience.featuresManager;
	}
	
	
	protected enableFeature(){
		let name  =   WebXRFeatureName[this._featureName as keyof WebXRFeatureName] as string || this._nativeName;
		if (name){
			try {
				this._nativeFeature =   this.featuresManager.enableFeature(name as string, "latest", this._featureOptions) as NATIVE_FEAT;
				this._isSupport     =   (this._nativeFeature && this._nativeFeature.isCompatible());
			
				if (this._isSupport){
					this.activateAttachListeners();
					this._nativeFeature.attach();
					this.activateDetachListener();
				}else{
					// Она и не будет аттачена
					this._nativeFeature.dispose();
				}
			}catch (e){
				// Если фичи нет или что-то пошло не так
			}
		}
	}
	
	
	// аттач слушаем
	protected activateAttachListeners(){
		this._attachListener = this._nativeFeature.onFeatureAttachObservable.addOnce((feature)=>{
			this.logger?.log('FEATURE ATTACHED: ' + this._featureName, 'info', 'add');
			this._featureAttached   =   true;
			this._featureDetached   =   false;
			this._featureAttached$.next();
			this.whenFeatureAttached();
		});
	}
	
	
	// Слшаем детач
	protected activateDetachListener(){
		this._detachListener = this._nativeFeature.onFeatureDetachObservable.addOnce((feature:IWebXRFeature)=>{
			this.detachHandler(true);
			this.whenFeatureDetached();
		});
	}
	
	// Исполняется после detach или при диспозе
	protected detachHandler(print?:boolean){
		this.logger?.log('FEATURE DETACHED: ' + this._featureName, 'info', 'delete');
		this._featureAttached   =   false;
		this._featureDetached   =   true;
		this._featureDetached$?.next();
	}
	
	
	// Добавляет кастомные фичи
	protected addCustomFeature(){
		if (this._nativeName){
			// Да, это кастом-фича
			const feat = this.featuresManager.getEnabledFeature(this._nativeName as string);
			if (!feat){
				// Здесь так, потому что необъяснимое расхождение между классом WebXRFeatureManager и
				// вроде бы им же, но нет. Ситуация на плейграунде не воспроизводится (работает всё)
				// Причины возможно в способе компиляции type?
				const ctor:Constructor<IWebXRFeature> = this._nativeConstructor;
				if (
					ctor
					&& ('AddWebXRFeature' in this.featuresManager.constructor )
					&& (typeof this.featuresManager.constructor.AddWebXRFeature === 'function')
				){
					this.featuresManager.constructor.AddWebXRFeature(
						this._nativeName,
						(xrSessionManager:WebXRSessionManager, options:unknown) => {
							return () => new ctor(xrSessionManager, options);
						},
						1, true
					);
				}
			}
		}
	}
	
	
	protected async whenFeatureAttached():Promise<void>{
	
	}
	
	
	protected async whenFeatureDetached():Promise<void>{
	
	}
	
	
	get nativeFeature():NATIVE_FEAT | undefined{
		return this._nativeFeature;
	}
	
	
	dispose(){
		this._featureAttached$.unsubscribe();
		this._featureDetached$.unsubscribe();
		//@ts-ignore
		this._featureDetached$ = null;
		//@ts-ignore
		this._featureAttached$ = null;
		this._attachListener?.remove();
		this._detachListener?.remove();
		if (this._featureAttached){
			this._nativeFeature.detach();
			this.featuresManager.disableFeature(this._featureName);
		}
		this._nativeFeature?.dispose();
		this.logger?.dispose('Feature: ' + this._featureName);
	}
}