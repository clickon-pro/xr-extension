export interface ILogger {
	log(
		...info:unknown[]
	):void;
	
	br(): void;
	
	dispose(message?: string):void;
}