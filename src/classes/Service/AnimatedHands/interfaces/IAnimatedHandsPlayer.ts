import {Skeleton}               from '@babylonjs/core/Bones/skeleton';
import type {Scene}             from '@babylonjs/core/scene';

export interface IAnimatedHandsPlayer {
	
	init(scene:Scene):void;
	
	readonly isPlayed: boolean;
	readonly isPaused: boolean;
	
	play(
		hand:XRHandedness,
		// bones positions
		positions:number[][],
		// bones rotations
		rotations:number[][],
		skeleton:Skeleton,
		loop?:boolean,
		onFrame?:(frameNumber:number)=>void
	):Promise<void>;
	
	goto(frame:number):void;
	
	stop():void;
	
	pause(val:boolean):void;
	
	dispose(): void;
}