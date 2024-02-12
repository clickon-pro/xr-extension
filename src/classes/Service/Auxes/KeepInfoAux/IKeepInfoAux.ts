import {Observable} from 'rxjs';

export interface IKeepInfoAux {

	readonly space:XRReferenceSpace | XRBoundedReferenceSpace | undefined;
	readonly pose:XRViewerPose | undefined;
	poseUpdate$:Observable<XRViewerPose | undefined>;
}



export interface IKeepInfoAuxInternal {
	setSpace(space:XRSpace):void;
	setPose(pose?:XRViewerPose):void;
}