import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';

export interface IOptionsApplicator {
	applyOptions(
		options:TTeleportDrawerOptions['placeOptions'],
		material:NodeMaterial,
	):void;
}