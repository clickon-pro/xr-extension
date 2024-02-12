import type {TQueProcessorOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/TQueProcessorOptions';

export type TGestureMatchOptions = {
	// Опции процессора комбинаций
	combinationProcessorOptions?:TQueProcessorOptions,
	
	// Если жест не угадывается на протяжении
	// Этого времени, то считается, что распознан
	// жест NOPE
	nopeGestureTimeMS:number,
	
	// Делать проверку каждые N frame's
	checkEveryNFrame?:number,
	
	debugConfig?:{
		outSlotName:string,
		slotNameForGesturesInfo?:string,
		slotNameForCombinationInfo?:string,
		// Собирать ли репорт по распознаванию в рекогнайзере фигур
		collectReport?:boolean,
		activateMiniReports?:boolean,
		miniReportEveryXms?:number,
		
		// Индикаторы совпадения в текущем кадре
		slotForFigureIndicator?:string,
		slotForWristIndicatorPitch?:string,
		slotForWristIndicatorRoll?:string,
		
		// Индикаторы углов
		slotForWristAnglesLeft?:string,
		slotForWristAnglesRight?:string
	}
}