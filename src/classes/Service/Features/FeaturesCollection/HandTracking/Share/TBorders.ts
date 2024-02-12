import type {TGesturePosSemanticX, TGesturePosSemanticY, TGesturePosSemanticZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';

type TX = Exclude<TGesturePosSemanticX, 'XR' | 'XL'>;

export type TBordersX = {[key in TX]:{min:number, max:number}}
export type TBordersY = {[key in TGesturePosSemanticY]:{min:number, max:number}}
export type TBordersZ = {[key in TGesturePosSemanticZ]:{min:number, max:number}}