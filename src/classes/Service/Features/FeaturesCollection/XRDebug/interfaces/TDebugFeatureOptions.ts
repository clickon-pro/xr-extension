export type TDebugFeatureOptions = {
	slots:{
		[slotName:string]:TSlotsDescription
	},
}

export type TSlotsDescription = {
	w:number,
	h:number,
	lines:number,
	offsetX:number,
	offsetY:number,
	txW:number,
	txH:number,
	zDistance?:number,
	color?:string,
	fontSize?:number,
	lineSpacing?:number,
}