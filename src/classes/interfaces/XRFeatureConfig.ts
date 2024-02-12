import type {TDebugFeatureOptions} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/TDebugFeatureOptions';
import type {TExtendHandTrackingOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/TExtendHandTrackingOptions';
import type {IWebXRHandTrackingOptions} from '@babylonjs/core';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';
import type {TUserStateFeatureOptions} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/TUserStateFeatureOptions';
import type {TTeleportFeatureOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/TTeleportFeatureOptions';
import type {TSpaceMarkUpOptions} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TSpaceMarkUpOptions';

export type TXRFeaturesConfig = {
	XR_DEBUG?:{
		nativeConfig?:TDebugFeatureOptions,
	},
	HAND_TRACKING?:{
		nativeConfig:Omit<IWebXRHandTrackingOptions, 'xrInput'>,
		extendConfig:TExtendHandTrackingOptions
	},
	USER_STATE?:{
		nativeConfig:TUserStateFeatureOptions,
	},
	TELEPORT?:{
		nativeConfig:TTeleportFeatureOptions,
	},
	// TODO
	LOCOMOTION?:{
	
	},
	SPACE_MARKUP?:{
		nativeConfig:TSpaceMarkUpOptions
	}
}
& {
	[key in Exclude<TXRFeatureNames, 'XR_DEBUG' | 'HAND_TRACKING' | 'USER_STATE' | 'TELEPORT'>]?:{
		nativeConfig?:unknown,
		extendConfig?:unknown
	}
};