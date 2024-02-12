import {Vector3}                from '@babylonjs/core/Maths/math.vector';

import {Subject} from 'rxjs';
import type {TReachPointDescription} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TReachPointDescription';
import type {TStepStairInfo} from '@classes/Service/Features/FeaturesCollection/SpaceMarkUp/interfaces/TStepStairInfo';

// AUX просто шлёт в потоки разное. Просто, чтобы разбить код на несколько классов
export class SpaceMarkUpSender {
	
	protected   _borderInfo$    =    new Subject<TReachPointDescription>();
	protected   _stairInfo$            =    new Subject<TStepStairInfo>();
	
	get borderInfo$(){  return this._borderInfo$;}
	get stairInfo$(){   return this._stairInfo$;}
	
	sendStepStart(pos:Vector3){
		this._stairInfo$.next({
			type:'STEP_BEGIN',
			payload:{
				position:pos.clone()
			}
		});
	}
	
	sendStepEnd(pos:Vector3){
		this._stairInfo$.next({
			type:'STEP_END',
			payload:{
				position:pos.clone()
			}
		});
	}
	
	sendReturnInSafe(lastStickyCameraPosition:Vector3){
		this._borderInfo$.next({
			type:'RETURN_IN_SAFE',
			payload:{
				position:{x:lastStickyCameraPosition.x, y:lastStickyCameraPosition.y, z:lastStickyCameraPosition.z},
			}
		});
	}
	
	sendExitFromSafe(lastStickyCameraPosition:Vector3, lastDangerZonePosition:Vector3){
		this._borderInfo$.next({
			type:'EXIT_FROM_SAFE',
			payload:{
				lastCorrectPoint:lastStickyCameraPosition,
				currentPoint:lastDangerZonePosition
			}
		});
	}
	
	sendMoveInDangerZone(lastStickyCameraPosition:Vector3, lastDangerZonePosition:Vector3){
		this._borderInfo$.next({
			type:'MOVE_IN_DANGER_ZONE',
			payload:{
				lastCorrectPoint:lastStickyCameraPosition,
				currentPoint:lastDangerZonePosition
			}
		});
	}
	
	dispose(){
		this._borderInfo$.complete();
		this._stairInfo$.complete();
	}
}