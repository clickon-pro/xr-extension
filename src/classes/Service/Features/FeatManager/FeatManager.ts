import {WebXRDefaultExperience}             from '@babylonjs/core/XR/webXRDefaultExperience';
import {Observable, Subject, Subscription}  from 'rxjs';
import {Container, inject, injectable}      from 'inversify';
import {FeaturesCfgMap, TFeaturesCfgMap}    from '@classes/Service/Features/Share/FeaturesConfigMap';
import type {IXRFeatManager}                from '@classes/Service/Features/FeatManager/IXRFeatManager';
import type {IXRFeatEnv}                    from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {TXRFeatureNames}               from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {IDebugXRFeatEnv}               from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeatEnv';
import type {TXRFeaturesConfig}             from '@classes/interfaces/XRFeatureConfig';
import type {TXRCommand}                    from '@classes/interfaces/TXRCommand';
import type {ILogger}                       from "@classes/Service/Shared/LoggerProvider/ILogger";

// Responsible for XR feature wrappers
@injectable()
export class FeatManager implements IXRFeatManager {
	
	protected _helper:WebXRDefaultExperience;
	
	// Storage for features
	protected _featuresEnvsMap:Map<TXRFeatureNames, {
		feature:IXRFeatEnv,
		cmdSubscription?:Subscription,
		attachedPromise:Promise<void>,
	}> = new Map();
	
	protected _whenFeatureAttached$  =   new Subject<IXRFeatEnv>();

	
	// Container
	protected _featuresContainer = new Container({
					defaultScope:'Transient'
	});
	
	
	// Config
	private configMap:TFeaturesCfgMap = FeaturesCfgMap;


	// Message stream coming from features, which will be added to the outgoing stream
	// of the XR service above
	protected _xrCommandFromFeatures$ = new Subject<TXRCommand>();
	
	
	constructor(
		@inject ('Logger')
		protected logger:ILogger
	) {}
	
	
	get xrCommandFromFeature$():Observable<TXRCommand>{
		return this._xrCommandFromFeatures$;
	}
	
	
	// MUST BE CALLED before init
	set parentContainer(cnt:Container){
		this._featuresContainer.parent = cnt;
	}
	
	
	protected binding(){
		for (let featureName in this.configMap) {
			// Bind if nothing is bound already
			if (!this._featuresContainer.isCurrentBound(featureName)){
				const ctor = this.configMap[featureName as unknown as TXRFeatureNames];
				if(ctor) {
					this._featuresContainer.bind(featureName).to(ctor);
				}
			}
		}
	}
	
	
	async init(
		helper:WebXRDefaultExperience,
		// Here the manager receives the stream of commands (events) that will exit from the XRService
		featuresConfig?:TXRFeaturesConfig
	) {
		this._helper = helper;
		this.binding();
		
		this.logger.log('Feature manager', 'info', 'init');
		this.logger.log('Features', 'info', 'groupCollapsed');
		this.disposeAllFeatures();
		if (featuresConfig){
			for (let configKey of Object.keys(featuresConfig)) {
				// If the feature was already created in the previous run, don't create it, just reinitialize it
				let featureEnv = this._featuresEnvsMap.get(configKey as TXRFeatureNames)?.feature;
				if (!featureEnv){
					featureEnv = this._featuresContainer.get<IDebugXRFeatEnv>(configKey);
					if(featureEnv){
						// This is to reassign for unknown features, to which the standard wrappers ('*') apply
						featureEnv.setFeatureName(configKey as TXRFeatureNames);
						
						this._featuresEnvsMap.set(configKey as TXRFeatureNames, {
							feature:featureEnv,
							// Subscription to a feature (may not exist)
							cmdSubscription:featureEnv.cmdFlow$?.subscribe((cmd)=>{
								this._xrCommandFromFeatures$.next(cmd);
							}),
							// Sending a message that the feature has been attached
							attachedPromise:featureEnv.whenAttached().then(()=>{
								this._whenFeatureAttached$.next(featureEnv!);
							})
						});
					}
				}
				if (featureEnv){ // Убирает фичи, которые, возможно были, но не заказаны в этом конфиге
					await featureEnv.init(
						helper,
						featuresConfig[configKey as TXRFeatureNames]?.nativeConfig,
						//@ts-ignore
						featuresConfig[configKey as TXRFeatureNames]?.extendConfig,
					)
				}
			}
		}
		this.logger.log('', 'info', 'groupEnd');
	}
	
	
	// Убирает фичи, которые, возможно были, но не заказаны в этом конфиге
	private disposeAllFeatures(){
		this._featuresEnvsMap.forEach((rec, fName)=>{
			this.removeFeature(fName);
		});
	}
	
	
	removeFeature(featureName:TXRFeatureNames){
		const fRecord = this._featuresEnvsMap.get(featureName);
		if (fRecord){
			fRecord.cmdSubscription?.unsubscribe();
			fRecord.feature.dispose();
			this._featuresEnvsMap.delete(featureName);
		}
	}
	
	
	get whenFeatureAttached$():Observable<IXRFeatEnv>{
		return this._whenFeatureAttached$;
	}
	
	
	getFeatureEnv(featureName:TXRFeatureNames):IXRFeatEnv | undefined{
		return this._featuresEnvsMap.get(featureName)?.feature;
	}
	
	
	dispose(){
		this._whenFeatureAttached$?.unsubscribe();
		this._xrCommandFromFeatures$?.unsubscribe();
		
		this._featuresEnvsMap.forEach((rec, name)=>{
			this.removeFeature(name);
		});
		this._featuresEnvsMap.clear();
	}
}