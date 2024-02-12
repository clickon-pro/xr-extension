import {FeatHandTrackingEnv} from '~/classes/Service/Features/FeaturesCollection/HandTracking/FeatHandTrackingEnv';
import {UnknownFeat} from '~/classes/Service/Features/Share/UnknownFeat';
import {FeatMovementEnv} from '~/classes/Service/Features/FeaturesCollection/Movement/FeatMovementEnv';
import {XRDebugEnv} from '~/classes/Service/Features/FeaturesCollection/XRDebug/XRDebugEnv';
import {UserStateEnv} from '@classes/Service/Features/FeaturesCollection/UserState/UserStateEnv';
import {TeleportFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Teleport/TeleportFeatureEnv';
import {LocomotionFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Locomotion/LocomotionEnv';
import {SpaceMarkUpEnv} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/SpaceMarkUpEnv';
import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {Constructor} from 'type-fest';
import type {TXRFeatureNames} from '@classes/Service/Features/Share/interfaces/TXRFeatureNames';


export type TFeaturesCfgMap = {[key in TXRFeatureNames]+?:Constructor<IXRFeatEnv>};

export const FeaturesCfgMap:TFeaturesCfgMap = {
    '*'                 :       UnknownFeat,
	'HAND_TRACKING'     :       FeatHandTrackingEnv,
	'MOVEMENT'          :       FeatMovementEnv,
	'XR_DEBUG'          :       XRDebugEnv,
	'USER_STATE'        :       UserStateEnv,
	'TELEPORT'          :       TeleportFeatureEnv,
	'LOCOMOTION'        :       LocomotionFeatureEnv,
	'SPACE_MARKUP'      :       SpaceMarkUpEnv
};
