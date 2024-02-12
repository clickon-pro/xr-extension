import {Observer}               from '@babylonjs/core/Misc/observable';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHand}              from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandTracking}      from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRFeatureName}       from '@babylonjs/core/XR/webXRFeaturesManager';
import type {IAbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/IAbstractHandsMeshProcessor';

// Provides basic functions for anything that works with hands (meshes, joints).
export abstract class AbstractHandsMeshProcessor implements IAbstractHandsMeshProcessor{
	
	protected   _addingHandWatcher:Observer<WebXRHand>;
	protected   _removeHandWatcher:Observer<WebXRHand>;
	protected   _helper:WebXRDefaultExperience;
	private     _handKeys =   {r:'right', right:'right', l:'left', left:'left'};
	protected   _hands:{
						right?:WebXRHand,
						left?:WebXRHand
				}   =   {};
	
	protected _isDisposed = false;
	
	
	init(
		helper:WebXRDefaultExperience,
		...args:any[]
	){
		this._helper = helper;
		this.activateHandsChangesListener();
	}
	
	
	protected whenHandAppear(h:WebXRHand){
	
	}
	
	
	protected whenHandDisappear(h:WebXRHand){
	
	}
	
	
	private activateHandsChangesListener(){
		const handFeature = this._helper.baseExperience.featuresManager.getEnabledFeature(WebXRFeatureName.HAND_TRACKING) as WebXRHandTracking | undefined;
		if (handFeature) {
			this._addingHandWatcher?.remove();
			this._addingHandWatcher = handFeature.onHandAddedObservable.add((h: WebXRHand) => {
				this._hands[this.extractKeyFromXRHand(h)] = h;
				this.whenHandAppear(h);
			});
			
			this._removeHandWatcher?.remove();
			this._removeHandWatcher = handFeature.onHandRemovedObservable.add((h) => {
				this._hands[this.extractKeyFromXRHand(h)] = undefined;
				this.whenHandDisappear(h);
			});
			
			// Perhaps the hands are already present in the feature at this moment?
			const lh = handFeature.getHandByHandedness('left');
			const rh = handFeature.getHandByHandedness('right');
			if (lh) this._hands['left'] = lh;
			if (rh) this._hands['right'] = rh;
		} else {
			console.warn('Hands processor: Hand tracking feature not available');
		}
	}
	
	
	private extractKeyFromXRHand(hand:WebXRHand):'left' | 'right'{
		return (hand.xrController.uniqueId.includes('right')) ? 'right' : 'left';
	}
	
	
	// Get the hand by any index
	protected getHand(key:'r' | 'l' | 'right' | 'left'):WebXRHand | undefined{
		const hKey = this._handKeys[key];
		return this._hands[hKey as 'right' | 'left'];
	}
	
	
	// Checks if hands are available at the moment
	protected handsReady(hands?:XRHandedness[]):boolean{
		let ret = false;
		if(hands && hands.length > 0){
			ret = true;
			hands.forEach(hand=>{
				ret = ret && Boolean(this._hands[hand as keyof typeof this._hands])
			});
		}
		return ret;
	}
	
	
	dispose(){
		this._addingHandWatcher?.remove();
		this._removeHandWatcher?.remove();
		this._isDisposed = true;
	}
}