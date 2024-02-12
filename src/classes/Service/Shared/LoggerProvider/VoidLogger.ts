import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";


// Stub
export class VoidLogger implements ILogger {
	
	clearHistory(): void {}
	
	br(): void {}
	dispose(message?: string): void {}
	log(message: string | object | any[], level?: any, mode?: any): void {}
	
	help(): void {}
	inMessage(header?: string, message?: any[] | object, level?: any): void {}
	configure(options: any): void {}
	
	outMessage(header?: string, message?: any[] | object, level?: any): void {}
	setSilentMode(mode: boolean): void {}
	showHistory(): void {}
}