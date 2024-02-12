import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';

import {AbstractOptionsApplicator} from '@classes/Service/Features/FeaturesCollection/Teleport/Shared/AbstractOptionsApplicator';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';

export class PlaceMaterialApplicator extends AbstractOptionsApplicator{

	
	
	applyOptions(
		options:TTeleportDrawerOptions['placeOptions'],
		material:NodeMaterial,
	){
		super.applyOptions(options, material);
	}
}