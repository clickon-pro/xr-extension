import {Observable} from 'rxjs';


export interface IRepo<RECORD_TYPE> extends Map<string, RECORD_TYPE> {
	
	readonly change$:Observable<IRepo<RECORD_TYPE>>;
	
	nativeClear():void;
	
}