
export interface IInitable {

// Result - initialization success status
// To switch the service to work with another scene - call init
	init(...args:any[]):Promise<any>;
}