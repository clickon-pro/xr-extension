import type {TJointsLink} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';


export type TTemplateReport = {
	links:TReportLink[],
	checks:number,
	recognized:number,
	accPercent:number,
	wrists:TWristReport[]
}

export type TReportLink = {
	link:TJointsLink,
	miss:number,
	match:number,
	accPercent:number
}

export type TWristReport = {
	hand:XRHandedness,
	roll:{
		miss:number,
		match:number,
		accPercent:number
	},
	pitch:{
		miss:number,
		match:number,
		accPercent:number
	}
}

export type TFigureRecognizeReport = {
	checks:number,
	recognized:number,
	accPercent:number,
	gestures:{[templateName:string]:TTemplateReport},
}