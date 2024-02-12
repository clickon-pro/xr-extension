import {BehaviorSubject} from 'rxjs';
import type {IRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/Repo/IRepo';


export abstract class Repo<RECORD_TYPE> extends Map<string, RECORD_TYPE> implements IRepo<RECORD_TYPE> {
	
	protected   _change$      =   new BehaviorSubject<this>(this);
	
	// TODO если потребуется сделать старое \ новое значение в поток
	
	set(key:string, value:RECORD_TYPE){
		const res = super.set(key, value);
		this._change$.next(this);
		return res;
	}
	
	clear() {
		const size = this.size;
		super.clear();
		if (size != this.size){
			this._change$.next(this);
		}
	}
	
	nativeClear(){
		super.clear();
	}
	
	delete(key: string): boolean{
		const res = super.delete(key);
		if (res) this._change$.next(this);
		return res;
	}
	
	get change$(){
		return this._change$;
	}
}