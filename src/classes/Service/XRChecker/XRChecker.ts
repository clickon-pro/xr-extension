import {injectable} from 'inversify';
import {WebXRFeaturesManager}   from '@babylonjs/core/XR/webXRFeaturesManager';
import {WebXRSessionManager}    from '@babylonjs/core/XR/webXRSessionManager';

import type {IXRChecker} from '~/classes/Service/XRChecker/IXRChecker';
import type {TXRDevicesNames} from '@classes/Service/XRChecker/TXRDevicesNames';



// Технические проверки состояний, поддержки, наличия фич и т.п.
@injectable()
export class XRChecker implements IXRChecker {
	
	
	public async isSupported():Promise<boolean>{
		let ret = false;
		
		if (navigator.xr){
			const supported = await WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
			if (supported) {
				ret = true;
				// xr available, session supported
			}
		}
		
		return ret;
	}
	
	
	getAvailableFeatures(sessionManager:WebXRSessionManager):string[]{
		// const featureManager = new WebXRFeaturesManager(sessionManager);
		const featureNamesList = WebXRFeaturesManager.GetAvailableFeatures();
		
		return featureNamesList;
	}
	
	
	async deviceName(): Promise<TXRDevicesNames | undefined> {
		let ret:TXRDevicesNames = undefined;
		
		if (await this.isSupported()){
			ret = 'UNKNOWN';
		}
		
		// TODO
		let ua = navigator.userAgent;
		if (ua.search('Quest 2') !== -1){
			ret = 'QUEST 2';
		} else if (ua.search('Quest 3') !== -1){
			ret = 'QUEST 3';
		} else if (ua.search('Quest Pro') !== -1){
			ret = "QUEST PRO"
		} else if (('vendor' in navigator) && navigator.vendor.search('Apple Computer, Inc.') != -1) {
			// TODO пока один девайс на Apple, но нормально его поймать точно нельзя
			ret = 'UNKNOWN APPLE'
		}
		
		return ret;
	}
	
	
	async deviceType():Promise<'regular' | 'apple'>{
		return await this.isApple() ? 'apple' : 'regular';
	}
	
	
	async isApple():Promise<boolean>{
		const dn = await this.deviceName();
		return ((dn == 'UNKNOWN APPLE') || (dn == 'AVP'));
	}
}
