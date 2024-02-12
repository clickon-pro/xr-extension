import {Nullator}                   from '@classes/Service/Features/Share/Nullator';
import {JOINTS_LIST}                from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/JointsList';
import {Quaternion}                 from '@babylonjs/core/Maths/math.vector';
import {Skeleton}                   from '@babylonjs/core/Bones/skeleton';
import {Vector3}                    from '@babylonjs/core/Maths/math.vector';
import {Observer}                   from '@babylonjs/core/Misc/observable';
import {WebXRHandTracking}          from '@babylonjs/core/XR/features/WebXRHandTracking';
import type {Scene}                 from '@babylonjs/core/scene';
import type {IAnimatedHandsPlayer}  from '@classes/Service/AnimatedHands/interfaces/IAnimatedHandsPlayer';



export class AnimatedHandsPlayer implements IAnimatedHandsPlayer {
	
	protected   _scene?:Scene;
	protected   _isPlayed           =   false;
	protected   _isPaused           =   false;
	protected   _currentFrame       =   0;
	protected   _observer?:Observer<Scene>;
	
	
	init(scene:Scene){
		this._scene = scene;
	}
	
	
	get isPlayed(): boolean {
		return this._isPlayed;
	}
	
	
	get isPaused(): boolean {
		return this._isPaused;
	}
	
	
	async play(
		hand:XRHandedness,
		positions:number[][],
		rotations:number[][],
		skeleton:Skeleton,
		loop?:boolean,
		onFrame?:(frameNumber:number)=>void
	):Promise<void>{
		
		this._isPaused = false;
		
		// We will rotate the animation only if everything necessary is in place
		if(
			(positions.length == rotations.length)
			&& (hand != 'none')
		){
			const frames = positions.length;
			this._currentFrame = 0;
			return new Promise<void>(
				(resolve)=>{
					this._isPlayed = true;
					this._observer = this._scene?.onBeforeRenderObservable.add(()=>{
						if(!this._isPaused){

							//@ts-ignore
							const rMap              =   WebXRHandTracking._GenerateDefaultHandMeshRigMapping(hand);
							const frameRecord   =   positions[this._currentFrame];
							const frameRecordQ  =   rotations[this._currentFrame];
							
							let index = 0;
							JOINTS_LIST.forEach((jName)=>{
								const boneIndex     = skeleton.getBoneIndexByName(rMap[jName]);
								const bnTn          = skeleton.bones[boneIndex].getTransformNode();
								
								if(bnTn){
									// Rotation
									bnTn.rotationQuaternion =   new Quaternion(
										frameRecordQ[(index * 4)],
										frameRecordQ[(index * 4) + 1],
										frameRecordQ[(index * 4) + 2],
										frameRecordQ[(index * 4) + 3],
									);
									
									// Position
									bnTn.position           =   new Vector3(
										frameRecord[(index * 3)],
										frameRecord[(index * 3) + 1],
										frameRecord[(index * 3) + 2]
									);
								}
								index++;
							});
							
							this._currentFrame++;
							if (onFrame) onFrame(this._currentFrame);
							if(this._currentFrame == frames){
								if(loop){
									this._currentFrame = 0;
								}else{
									this.stop();
									resolve();
								}
							}
						}
					});
				}
			);
		}
	}
	
	
	goto(frame:number){
		this._currentFrame = frame;
	}
	
	
	stop(){
		this._isPlayed = false;
		this._observer?.remove();
	}
	
	
	pause(val: boolean) {
		if(this._isPlayed){
			this._isPaused = val;
		}
	}
	
	
	dispose(){
		this.stop();
		Nullator(this);
	}
}