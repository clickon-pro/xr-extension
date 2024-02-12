
export type TQueProcessorOptions = {

	maxQueueLength:number,
	
	// Максимальное количество тиков, которое может быть в очереди у последнего жеста,
	// После чего этот жест становится единственным (последовательность обнуляется)
	// и считается только этот последний повторяющийся жест
	maxReplies:number,
	
	// Какие комбинации ловить
	// !!! Чем ближе комбинация к началу, тем она приоритетнее
	// Если она будет обнаружена, то она удаляется из очереди
	// selectedCombinations:string[];

	// Время жизни
	gestureLifeTimeMS:number;
	
	// Периодичность тиков (как часто будет проверяться очередь для очистки)
	lifeTimeTickMS?:number;
	
	// Время, которое должен продержаться NOPE, чтобы считаться, что это реально длинный NOPE,
	// а не короткое время, когда одна фигура сменяет другую и в промежутке появляется короткий NOPE
	nopeMinTimeMS?:number;
	
	// В режиме отладки
	debugConfig?:{
		outSlotName?:string,
		combinationSlotName?:string,
		activateMiniReports?:boolean,
		miniReportEveryXms?:number,
		// Будет выводить очередь (когда больше 1ой записи)
		logQue?:boolean,
		queSlotName?:string
	};
}