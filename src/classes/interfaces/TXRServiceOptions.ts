import type {TXRFeaturesConfig} from '@classes/interfaces/XRFeatureConfig';

export type TXRServiceOptions = {
	mode:'immersive-vr' | 'immersive-ar',
	features?:TXRFeaturesConfig,
	needBabylonUIEnterButton?:boolean,
	floors?:string[],
	enableColliding?:boolean,
	debugConfig?:{
		outSlotName:string,
	}
}