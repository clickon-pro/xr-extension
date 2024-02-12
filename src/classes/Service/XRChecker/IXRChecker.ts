import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';
import type {TXRDevicesNames} from '@classes/Service/XRChecker/TXRDevicesNames';


export interface IXRChecker {
	isSupported():Promise<boolean>;
	getAvailableFeatures(sessionManager:WebXRSessionManager):string[];
	deviceName():Promise<TXRDevicesNames | undefined>;
	isApple():Promise<boolean>;
	deviceType():Promise<'regular' | 'apple'>;
}


export type IXRCheckerPublic = Pick<IXRChecker,
	'isApple' | 'deviceName' | 'isSupported'
>