import type {Scene}             from '@babylonjs/core/scene';
import {WebXRDefaultExperienceOptions} from '@babylonjs/core/XR/webXRDefaultExperience';

import type {TXRServiceOptions} from '@classes/interfaces/TXRServiceOptions';
import type {XRExtensionConfig} from '@classes/interfaces/XRExtensionConfig';


export interface IHelperConfigBuilder {
	build(
		scene:Scene,
		options?:TXRServiceOptions,
		extensionConfig?:XRExtensionConfig
	): WebXRDefaultExperienceOptions;
}