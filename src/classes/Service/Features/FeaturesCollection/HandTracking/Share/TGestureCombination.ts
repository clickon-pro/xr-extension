export type TGestureCombination = {
	name:string,
	// Описывает последовательность, которую надо слушать процессору
	seq:TCombinationSequenceRecord[],
	holdLast?:boolean,
	// Можно добавить специальную функцию, которая будет вычислать некий дополнительный пайлоад
	// Удобно, чтобы не помещать это в основной код
	// TODO не реализовано, может позже
	// calculatedPayload?:(_helper:WebXRDefaultExperience, nativeFeature:WebXRHandTracking)=>unknown;
}

export type TGestureSemanticCoords = {
	x:TGesturePosSemanticX | TGesturePosSemanticANY,
	y:TGesturePosSemanticY | TGesturePosSemanticANY,
	z:TGesturePosSemanticZ | TGesturePosSemanticANY
};

export type TCombinationSequenceRecord = TGestureInformation & {
	// TODO что здесь ещё дописать
}

export type TGestureInformation = {
	templateName:string,
	r?:{
		semantic:TGestureSemanticCoords[]
	},
	l?:{
		semantic:TGestureSemanticCoords[]
	}
}


export type TGesturePosSemanticX    =  'XL4' | 'XL3' | 'XL2' | 'XL1' | 'XC' | 'XR1' | 'XR2' | 'XR3' | 'XR4' |
										// наборы
										'XR' | 'XL';
export type TGesturePosSemanticY    =  'YH3' | 'YH2' | 'YH1' | 'YC' | 'YL1' | 'YL2' | 'YL3' | 'YL4' | 'YL5';
export type TGesturePosSemanticZ    =  'ZA' | 'ZB' | 'ZC' | 'ZD' | 'ZE';
export type TGesturePosSemanticANY  =  'ANY';
export type TGesturePosSemantic     =   TGesturePosSemanticANY | TGesturePosSemanticX | TGesturePosSemanticY | TGesturePosSemanticZ;
export type TGesturePosSemanticByAxis<AXIS extends 'x' | 'y' | 'z'> = byAxis[AXIS];

type byAxis = {
	x:TGesturePosSemanticX,
	y:TGesturePosSemanticY,
	z:TGesturePosSemanticZ
}