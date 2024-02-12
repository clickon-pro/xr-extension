import {injectable} from 'inversify';
import {Observable, Subject} from 'rxjs';
import type {IKeepInfoAux, IKeepInfoAuxInternal} from '@classes/Service/Auxes/KeepInfoAux/IKeepInfoAux';

// Storage for various useful XR system information
// For example, pose, space, etc.
@injectable()
export class KeepInfoAux implements IKeepInfoAux, IKeepInfoAuxInternal{
	
	protected _poseUpdate$ = new Subject<XRViewerPose | undefined>();
	
	// Space
	protected   _space:XRReferenceSpace | XRBoundedReferenceSpace;
	
	// Pose
	protected   _poseFromLastFrame:XRViewerPose | undefined;
	
	
	get space(){
		return this._space;
	}
	
	
	get pose(){
		return this._poseFromLastFrame;
	}
	
	
	get poseUpdate$(){
		return this._poseUpdate$ as Observable<XRViewerPose | undefined>;
	}
	
	
	setSpace(space:XRReferenceSpace | XRBoundedReferenceSpace):void{
		this._space = space;
	}
	
	
	setPose(pose:XRViewerPose | undefined):void{
		this._poseFromLastFrame = pose;
		this._poseUpdate$.next(pose);
	}
}