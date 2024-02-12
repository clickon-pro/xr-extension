import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';
import type {TTeleportDrawerOptions} from '@classes/Service/Features/FeaturesCollection/Teleport/Drawer/TTeleportDrawerOptions';

export type TTeleportFeatureOptions = {
	floorMeshes?:AbstractMesh[],
	// Может быть указана непосредственно в функцию наведения (Это скорость начальная m/s)
	strength?:number,
	gravity?:number,
	drawerOptions?:TTeleportDrawerOptions
}