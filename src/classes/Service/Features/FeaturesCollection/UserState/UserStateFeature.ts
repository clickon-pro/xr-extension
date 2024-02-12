import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';
import {WebXRAbstractFeature}   from '@babylonjs/core/XR/features/WebXRAbstractFeature';
import {FreeCamera}             from '@babylonjs/core/Cameras/freeCamera';
import type {Nullable}          from '@babylonjs/core/types';
import type {IUserStateXRFeature} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/IUserStateXRFeature';
import type {TUserStateFeatureOptions} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TUserStateFeatureOptions';
import type {TXRUserState} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TXRUserState';
import {Observable, Subject} from 'rxjs';

/**
 * @obsolete
 */
export class UserStateFeature extends WebXRAbstractFeature implements IUserStateXRFeature {
	
	protected   _feature:IUserStateXRFeature;
	protected   _flowSenderActive = false;
	private     _frameCount: number;
	protected   _helper:WebXRDefaultExperience;
	protected   _statesFlow$  = new Subject<TXRUserState>();

	
	constructor(
		manager:WebXRSessionManager,
		protected _options: TUserStateFeatureOptions,
	) {
		super(manager);
		// console.log('OPTIONS USER STATE', this._options);
		
		this._frameCount = this._options.sendStateEveryNXRFrames || 1;
		this._flowSenderActive = this._options.sendInFlow || false;
	}
	
	get flow$():Observable<TXRUserState>{
		return this._statesFlow$;
	}
	
	activateFlowSending(val?:boolean){
		this._flowSenderActive = val || false;
	}
	
	/**
	 * Code in this function will be executed on each xrFrame received from the browser.
	 * This function will not execute after the feature is detached.
	 * @param _xrFrame the current frame
	 */
	protected _onXRFrame(xrFrame: XRFrame): void {
		
		if (this._options.sendInFlow && this.attached){
			this._frameCount--;
			if (this._frameCount <= 0){
				this._frameCount = 1;
				this.sendInFlow();
			}
		}
	}
	
	setHelper(helper:WebXRDefaultExperience){
		this._helper = helper;
	}
	
	getUserState(){
		return this.prepareData();
	}
	
	protected sendInFlow(){
		this._statesFlow$.next(this.prepareData());
	}
	
	protected prepareData():TXRUserState{
		const ret:TXRUserState = {};
		const processCamera = (mountPoint:'camera' | 'left' | 'right', camera?:Nullable<FreeCamera>)=>{
			if (camera){
				ret[mountPoint] = {};
				const camPos = camera.position;
				ret[mountPoint]!.position = {x:camPos.x, y:camPos.y, z:camPos.z};
				
				const camQtr = camera.rotationQuaternion;
				if (camQtr){
					ret[mountPoint]!.orientation = {x:camQtr.x, y:camQtr.y, z:camQtr.z, w:camQtr.w};
				}
			}
		}
		
		processCamera('camera', this._helper.baseExperience.camera);
		processCamera( 'right', this._helper.baseExperience.camera.rightCamera);
		processCamera('left', this._helper.baseExperience.camera.leftCamera);
		
		return ret;
	}
	
	dispose() {
		this._statesFlow$.unsubscribe();
		super.dispose();
	}
}