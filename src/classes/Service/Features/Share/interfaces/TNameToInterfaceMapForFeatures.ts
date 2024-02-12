import type {IHandTrackingXRFeatEnv} from '@classes/Service/Features/FeaturesCollection/HandTracking/IHandTrackingXRFeatEnv';
import type {IDebugXRFeatEnv} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeatEnv';
import type {IXRFeatEnv} from '@classes/Service/Features/Share/interfaces/IXRFeatEnv';
import type {IUserStateXRFeatEnv} from '@classes/Service/Features/FeaturesCollection/UserState/interfaces/IUserStateXRFeatEnv';
import type {ITeleportXRFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Teleport/interfaces/ITeleportXRFeatureEnv';
import type {ILocomotionXRFeatureEnv} from '@classes/Service/Features/FeaturesCollection/Locomotion/interfaces/ILocomotionXRFeatureEnv';
import type {ISpaceMarkUpEnv} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/ISpaceMarkUpEnv';


// Не удалять импорты - они здесь чтобы быстро перейти на списки имён при добавлении новых обёрток
// import {WebXRFeatureName} from '@babylonjs/core';
// Имена нативных фич - WebXRFeatureName

// Связывает имена фич с их интерфейсами
// Нужно для экстрактинга фич сразу с нужным интерфейсом
export type TNameToInterfaceMapForFeatures = {
	// * - мы не имеем обёртки на фичей и создаём её без обёртки
	'*':unknown,
	HAND_TRACKING:IHandTrackingXRFeatEnv,
	XR_DEBUG:IDebugXRFeatEnv,
	// TODO когда у мувмента будет свой интерфейс заменить на него
	MOVEMENT:IXRFeatEnv,
	USER_STATE:IUserStateXRFeatEnv,
	TELEPORT:ITeleportXRFeatureEnv,
	LOCOMOTION:ILocomotionXRFeatureEnv,
	SPACE_MARKUP:ISpaceMarkUpEnv
}

