import type {IVector2Like}      from '@babylonjs/core/Maths/math.like';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';

export type TTeleportDrawerOptions = {
	hopLineOptions?:{
		hopLineWidth?:number
		
		animationSpeed?:number,
		textureColorHex?:string;
		bordersColorHex?:string,
		texture?:Texture,
		textureScaling?:IVector2Like,
	},
	placeOptions?:{
		placeScaling?:number,
		placeOffset?:number,
		visibility?:number,
		
		animationSpeed?:number,
		textureColorHex?:string;
		bordersColorHex?:string,
		texture?:Texture,
		textureScaling?:IVector2Like,
	}
}