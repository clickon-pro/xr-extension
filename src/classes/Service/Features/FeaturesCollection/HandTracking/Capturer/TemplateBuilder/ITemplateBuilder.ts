import type {TGestureTemplateNeo, TJointsLink, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';


export interface ITemplateBuilder {
	summarize(
		templateName:string,
		templateType:TGestureTemplateNeo['type'],
		deviceMode:'apple' | 'regular',
		capturedLinks:TJointsLink[][],
		softness?:number,
		capturedWristsAngles?:TWristAngles[]
	):TGestureTemplateNeo;
	
	// Мержит 2 темлейта. Имя и тип возьмёт из первого операнда
	mergeLinks(
		templateA:TGestureTemplateNeo,
		templateB:TGestureTemplateNeo
	):TGestureTemplateNeo;
	
	setSoftness(
		template:TGestureTemplateNeo,
		softness:number,
		// Если не указан - установит на оба варианта
		deviceMode?:'apple'|'regular',
	):void;
	
	applyWrists(
		templateA:TGestureTemplateNeo,
		templateB:TGestureTemplateNeo
	):TGestureTemplateNeo;
	
	// Добавит вристы в темплате
	addWrists(
		template:TGestureTemplateNeo,
		wrists:TWristDesc[]
	):Promise<void>;
}