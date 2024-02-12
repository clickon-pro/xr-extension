import {Nullator}               from '@classes/Service/Features/Share/Nullator';
import {SceneLoader}            from '@babylonjs/core/Loading/sceneLoader';
import {TransformNode}          from '@babylonjs/core/Meshes/transformNode';
import {Material}               from '@babylonjs/core/Materials/material';
import {Quaternion}             from '@babylonjs/core/Maths/math.vector';
import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {Skeleton}               from '@babylonjs/core/Bones/skeleton';
import {AnimatedHandsPlayer}    from '@classes/Service/AnimatedHands/AnimatedHandsPlayer';
import type {IAnimatedHand}             from '@classes/Service/AnimatedHands/interfaces/IAnimatedHand';
import type {TAnimatedHandDescription}  from '@classes/Service/AnimatedHands/interfaces/TAnimatedHandDescription';
import type {IAnimatedHandsPlayer}      from '@classes/Service/AnimatedHands/interfaces/IAnimatedHandsPlayer';
import type {THandsAnimationData}       from '@classes/Service/Features/FeaturesCollection/HandTracking/AnimationRecorder/interfaces/THandsAnimationData';
import type {Scene}                     from '@babylonjs/core/scene';
import type {Nullable}                  from '@babylonjs/core/types';
import type {AbstractMesh}              from '@babylonjs/core/Meshes/abstractMesh';

export class AnimatedHand implements IAnimatedHand {
	
	protected _mainRoot:TransformNode;
	protected _transformsNode:TransformNode;
	protected _bonesRootTnNode:TransformNode;
	protected _mesh:AbstractMesh;
	protected _skeleton:Skeleton;
	protected _player:IAnimatedHandsPlayer | undefined;
	
	protected _isDisposed = false;
	
	// _mainRoot - for positioning
	//      _transformNode - for transformations (after loading, etc.)
	//              _bonesRootTnNode - parent node to which all TN associated with bones will be attached
	//                      bone1 (wrist)
	//                      bone2
	//              _mesh
	//                  skeleton
	
	constructor(
		protected _handName:XRHandedness,
		protected _scene:Scene,
		protected name?:string
	) {
		const nm = name ? name + '_' : '';
		// Positioning
		this._mainRoot      = new TransformNode('animatedHandRoot_' + nm + this._handName, this._scene);
		// Node for transformations
		this._transformsNode = new TransformNode('animatedHandTN_' + nm + this._handName, this._scene);
		this._transformsNode.setParent(this._mainRoot);
	}
	
	get mesh(){
		return this._mesh;
	}
	
	get isDisposed():boolean{
		return this._isDisposed;
	}
	
	get root():TransformNode{
		return this._mainRoot;
	}
	
	protected get player():IAnimatedHandsPlayer{
		if(!this._isDisposed && !this._player) {
			this._player = new AnimatedHandsPlayer();
			this._player.init(this._scene);
		}
		//@ts-ignore
		return this._player;
	}
	
	
	async play(
		data:THandsAnimationData,
	    loop?:boolean,
		onFrame?:(frameNumber:number)=>void,
		onStarted?:()=>void,
		onEnded?:()=>void
	){
		if(
			this.isReady
			&& data[this._handName as 'right' | 'left']?.length
			&& data[this._handName + 'Q' as 'rightQ' | 'leftQ']?.length
		){
			if(onStarted)   onStarted();
			await this.player.play(
				this._handName,
				data[this._handName as 'right' | 'left']!,
				data[this._handName + 'Q' as 'rightQ' | 'leftQ']!,
				this._skeleton,
				loop,
				onFrame
			);
			if(onEnded) onEnded();
			this._player?.dispose();
		}
	}
	
	
	goto(frame:number){
		this.player?.goto(frame);
	}
	
	
	pause(val:boolean):void{
		this.player?.pause(val);
	}
	
	
	stop():void{
		this.player?.stop();
		this._player?.dispose();
	}
	
	
	get isPlayed(){
		return this.player?.isPlayed;
	}
	
	
	get isPaused(){
		return this.player?.isPaused;
	}


	// The structure will be __root_
	// The first node in the mesh is the hand mesh
	async loadModelFromFile(url:string):Promise<boolean>{
		let res = false;
		try {
			const loadResult = await SceneLoader.ImportMeshAsync(undefined, url, undefined, this._scene);
			if(
				loadResult.meshes.length > 1
				&& loadResult.skeletons.length > 0
			){
				// There should be at least 2 meshes
				this.coordinatesModifications(loadResult.meshes[0]!);
				// TODO сделать что-то по имени? Меш то может быть какой-то иной?
				this._mesh = loadResult.meshes[1];
				res = this.prepareSkeleton(loadResult.skeletons[0]);
			}
		}catch (e) {
			console.log('AnimatedHand loading fail', 'warns', 'warn');
		}
		return res;
	}
	
	
	setPosition(position:Vector3){
		this._mainRoot.position = position;
	}
	
	
	setRotation(rotation:Quaternion){
		this._mainRoot.rotationQuaternion = rotation;
	}
	
	
	setScaling(scaling:number){
		this._mainRoot.scaling = new Vector3(scaling,scaling,scaling);
	}
	
	
	setEnabled(val:boolean){
		this._mainRoot.setEnabled(val);
	}
	
	
	// Converts coordinates
	protected coordinatesModifications(loadRoot:TransformNode){
		loadRoot.getChildren(undefined, true).forEach((node:TransformNode)=>{
			node.setParent(null);
			node.setAbsolutePosition(new Vector3(0,0,0));
			node.scaling            =   new Vector3(1,1,1);
			node.rotation           =   new Vector3(0,0,0);
			node.rotationQuaternion =   null;
			node.setParent(this._transformsNode);
		});
		loadRoot.dispose();
		// this._transformsNode.scaling.z = -1;
	}
	
	
	protected prepareSkeleton(skeleton:Skeleton):boolean{
		let res = false;
		this._skeleton = skeleton;
		for (let bone of skeleton.bones) {
			if(!bone.parent){
				// Consider this bone as the root
				const tn =  bone.getTransformNode();
				if (tn){
					this._bonesRootTnNode = tn;
					res = true;
					break;
				}
			}
		}
		return res;
	}
	
	
	// It's better to use the loader, then all transformations will be automatic
	init(
		handDesc:Partial<TAnimatedHandDescription>
	){
		this._mesh = handDesc.mesh || this._mesh;
		this._mesh.parent = this._transformsNode;
		if(this._mesh.skeleton) this._skeleton = this._mesh.skeleton;
		
		if(handDesc.skeleton){
			this._skeleton = handDesc.skeleton;
			if(this._mesh){
				this._mesh.skeleton = this._skeleton;
			}
		}
		
		if(handDesc.bonesRoot){
			this._bonesRootTnNode = handDesc.bonesRoot;
		}
	}
	
	
	get isReady(){
		return Boolean(
			this._mesh
			&& this._skeleton
			&& this._bonesRootTnNode
		);
	}
	
	
	get material():Nullable<Material>{
		return this._mesh?.material;
	}
	
	
	set material(mat:Nullable<Material>){
		if(this._mesh) this._mesh.material = mat;
	}
	
	
	dispose(disposeMaterialAndTextures?:boolean){
		this._player?.dispose();
		this._mesh?.dispose(false, disposeMaterialAndTextures);
		this._skeleton?.dispose();
		this._mainRoot?.dispose();
		
		Nullator(this, 'keepByList', ['isDisposed', '_isDisposed']);
		this._isDisposed = true;
	}
}