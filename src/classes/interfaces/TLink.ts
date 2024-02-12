import type {TJointInfo} from '@classes/interfaces/TJointInfo';

export type TLink = {
	weight:'h' | 'n' | 'l' | 'ul',
	from:TJointInfo,
	to:TJointInfo,
	forTune?:boolean
}