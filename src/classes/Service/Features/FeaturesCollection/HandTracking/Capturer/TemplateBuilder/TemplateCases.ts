import type {TGestureTemplateNeo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';

// Какие руки надо брать для каких типов жестов и какие ключи создавать
export const Cases:Map<TGestureTemplateNeo['type'], ('left' | 'right')[]> = new Map([
	['right',       ['right']],
	['left',        ['left']],
	['any-hand',    ['left', 'right']],
	['both-hand',   ['left', 'right']]
]);