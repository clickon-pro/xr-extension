import type {TBordersX, TBordersY, TBordersZ} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TBorders';

// не трогать
export const EYES_POINT_Y = 1.64 as const;

export const bordersX:TBordersX = {
	'XL4':       {max:1.2,  min:0.5},
	'XL3':       {max:0.5,  min:0.35},
	'XL2':       {max:0.35, min:0.20},
	'XL1':       {max:0.20, min:0.05},
	'XC':   {min:-0.05, max:0.05},
	'XR1':       {max:-0.05,  min:-0.20},
	'XR2':       {max:-0.20,  min:-0.35},
	'XR3':       {max:-0.35,  min:-0.50},
	'XR4':       {max:-0.50,  min:-1.2},
} as const;


export const bordersY:TBordersY = {
	'YH3':       {min:0.35, max:1.2},
	'YH2':       {min:0.20, max:0.35},
	'YH1':       {min:0.05, max:0.20},
	'YC':     {min:-0.10, max:0.05},
	'YL1':       {min:-0.25, max:-0.10},
	'YL2':       {min:-0.40, max:-0.25},
	'YL3':       {min:-0.55, max:-0.40},
	'YL4':       {min:-0.7,  max:-0.55},
	'YL5':       {min:-1.2,  max:-0.7}
} as const;


export const bordersZ:TBordersZ = {
	'ZA'        :       {min:-0.25,  max:0.15},
	'ZB'        :       {min:0.15,  max:0.30},
	'ZC'        :   {min:0.30,  max:0.45},
	'ZD'        :       {min:0.45,  max:0.60},
	'ZE'        :       {min:0.60,  max:1},
} as const;
