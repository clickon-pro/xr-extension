import {Material}                       from '@babylonjs/core/Materials/material';
import {TransformNode}                  from '@babylonjs/core/Meshes/transformNode';
import {Vector3}                        from '@babylonjs/core/Maths/math.vector';
import {Quaternion}                     from '@babylonjs/core/Maths/math.vector';
import type {Nullable}                  from '@babylonjs/core/types';
import type {AbstractMesh}              from '@babylonjs/core/Meshes/abstractMesh';
import type {TAnimatedHandDescription}  from '@classes/Service/AnimatedHands/interfaces/TAnimatedHandDescription';
import type {THandsAnimationData}       from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';


export interface IAnimatedHand {
	readonly isReady:boolean;
	readonly isPaused:boolean;
	readonly isPlayed:boolean;
	readonly root:TransformNode;
	readonly mesh:AbstractMesh;
	
	init(handDesc:Partial<TAnimatedHandDescription>):void;
	loadModelFromFile(url:string):Promise<boolean>;
	setPosition(position:Vector3):void;
	setRotation(rotation:Quaternion):void;
	setScaling(scaling:number):void;
	setEnabled(val:boolean):void;
	
	play(
		data:THandsAnimationData,
		loop?:boolean,
		onFrame?:(frameNumber:number)=>void,
		onStarted?:()=>void,
		onEnded?:()=>void
	):Promise<void>;
	
	material:Nullable<Material>;
	
	stop():void;
	goto(frame:number):void;
	pause(val:boolean):void;
	
	readonly isDisposed:boolean;
	dispose(disposeMaterialAndTextures?:boolean):void;
}