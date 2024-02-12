

export interface IMatchingResult {
	templateName:string | undefined,
	isMatch:boolean,
	hands:('r' | 'l')[]
}