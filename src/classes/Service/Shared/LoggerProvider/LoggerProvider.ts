// import {ClickLogger} from "@clickon/clicklogger/src/classes/Core/ClickLogger";

import {VoidLogger} from '@classes/Service/Shared/LoggerProvider/VoidLogger';

export const LoggerProvider = ()=>{
	// const logger = new ClickLogger();
/*	logger.configure({
		startInSilentMode:silent,
		// startInSilentMode:true,
		windowAttachPointPath:'clickon.logger',
		withTypes:true,
	});*/
	return new VoidLogger();
}