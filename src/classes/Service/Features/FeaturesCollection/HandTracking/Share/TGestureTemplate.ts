

// TODO переделать на XRHandeness
export type TJointsLink = {
	min:number,
	val:number,
	max:number,
	weight:'h' | 'n' | 'l' | 'ul',
	from:{
		id:string,
		h:'r' | 'l',
	},
	to:{
		id:string,
		h:'r' | 'l',
	}
}


export type TGestureTemplateNeo = {
	name:string,
	type:
	// Шаблон содержит жест одной руки
		'left' | 'right'
		
		// Обе руки формируют один жест
		| 'both-hand'
		
		// Совпадение с любой из рук считается совпадением жеста
		// Линки между руками будут проигнорированы
		| 'any-hand',
	regular?:{
		softness:number,
		links:TJointsLink[],
		wrists?:TWristDesc[]
	},
	apple?:{
		softness:number,
		links:TJointsLink[],
		wrists?:TWristDesc[]
	}
}


export type TWristDesc = {
	hand:XRHandedness,
	useAnglesForDetection?:boolean,
	
	initialRoll?:number,
	limitRoll?:number,
	
	initialPitch?:number,
	limitPitch?:number
}