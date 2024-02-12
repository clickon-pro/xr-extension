import {EComponentType} from '~/classes/interfaces/EComponentType';


export type XRConfig = {
	components:{
		id:string,
		on:boolean,
		type:EComponentType
	}[]
}
