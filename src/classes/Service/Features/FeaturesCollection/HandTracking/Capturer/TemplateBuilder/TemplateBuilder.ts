import {cloneDeep} from 'lodash';
import {XRChecker} from '@classes/Service/XRChecker/XRChecker';
import type {ITemplateBuilder} from '@classes/Service/Features/FeaturesCollection/HandTracking/Capturer/TemplateBuilder/ITemplateBuilder';
import type {TGestureTemplateNeo, TJointsLink, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';


// Расширение GestureCapturer для обработки захваченных данных в шаблон
export class TemplateBuilder implements ITemplateBuilder{
	
	protected _capturedLinks:TJointsLink[][] = [];
	protected _template:TGestureTemplateNeo;
	protected _deviceMode:'apple' | 'regular' = 'regular';
	protected _templateType:TGestureTemplateNeo['type'];
	protected _capturedWristsAngles:TWristAngles[] = [];
	
	summarize(
		templateName:string,
		templateType:TGestureTemplateNeo['type'],
		deviceMode:'apple' | 'regular',
		capturedLinks:TJointsLink[][],
		softness?:number,
		capturedWristsAngles?:TWristAngles[],
	): TGestureTemplateNeo {
		this._capturedLinks         =   capturedLinks;
		this._deviceMode            =   deviceMode;
		this._templateType          =   templateType;
		this._capturedWristsAngles  =   capturedWristsAngles || [];
		
		this._template              =   {
										name:templateName,
										type:templateType,
										};
		
		this._template[deviceMode]  =   {
											softness:softness || 0.5,
											links:[],
											wrists:[]
										};
		
		// links
		this.addPassWithAverages();
		this.calcAverageStandard();
		this.filterBySigma();
		
		// wrists
		// this.processWrists();
		
		this.moveDataToResult();
		
		return this._template;
	}
	
	
	// Устанавливает мягкость для шаблона
	setSoftness(
		template:TGestureTemplateNeo,
		softness:number,
		// Если не указан - установит на оба варианта
		deviceMode?:'apple'|'regular',
	):void{
		const devices = [];
		if(deviceMode){
			devices.push(deviceMode);
		}else{
			devices.push('apple');
			devices.push('regular');
		}
		
		devices.forEach((device:'apple'|'regular') => {
			if (template[device] != undefined){
				template[device]!.softness = softness;
			}
		});
	}
	
	
	// Найдёт соотвествующую запись в проходе
	private getSameRecord(record:TJointsLink, passIndex:number):TJointsLink | undefined{
		return this._capturedLinks[passIndex].find((link)=>{
			return Boolean(
				(record.from.h == link.from.h)
				&& (record.from.id == link.from.id)
				&& (record.to.h == link.to.h)
				&& (record.to.id == link.to.id)
			);
		});
	}
	
	
	// Добавит фейковый проход слева и рассчитает средние значения
	protected addPassWithAverages(){
		// 1. Создадим фейковый проход, в который положим средние значения
		const fakePass = cloneDeep(this._capturedLinks[0]);
		this._capturedLinks.unshift(fakePass);
		
		// 2. Посчитаем средние значения для замеров
		fakePass.forEach((rec)=>{
			let avg = 0;
			for(let pn = 1; pn<this._capturedLinks.length; pn++){
				// Ищем этот замер в проходе (могут не совпадать по положению в некоторых случаях)
				const sameRecord = this.getSameRecord(rec, pn);
				avg = avg + (sameRecord?.val || 0);
			}
			//первый добавили фейковый, он не участвует
			rec.val = avg/(this._capturedLinks.length-1);
			// console.log('AVG', rec.val);
			// debugger
		});
	}
	
	protected calcAverageStandard(){
		// Рассчитаем среднеквадратичное отклонение.
		// Запишем его в min фейкового прохода
		const fakePass = this._capturedLinks[0];
		
		fakePass.forEach((rec)=>{
			const avg = rec.val;
			for(let pn = 1; pn<this._capturedLinks.length; pn++){
				// Ищем этот замер в проходе (могут не совпадать по положению в некоторых случаях)
				const sameRecord = this.getSameRecord(rec, pn);
				if (sameRecord){
					rec.min = rec.min + Math.pow(sameRecord.val - avg , 2);
				}
			}
			rec.min = Math.sqrt(rec.min/(this._capturedLinks.length-1)); // СИГМА
		});
	}
	
	
	// Отфильтровать случайные значения по правилу 3х сигм
	// и расситать min, max, average
	protected filterBySigma(){
		const fakePass = this._capturedLinks[0];
		fakePass.forEach((rec)=>{
			
			const sigma25 = rec.min * 2.5;
			
			let average =   0;
			let min     =   Infinity;
			let max     =   -Infinity;
			let count   =   0;
			
			for(let pn = 1; pn < this._capturedLinks.length; pn++){
				// Ищем этот замер в проходе
				const sameRecord = this.getSameRecord(rec, pn);
				if (sameRecord) {
					if (Math.abs(sameRecord.val) < sigma25) {
						// Правило 3х сигм
						// Прошли фильтр
						average = average + sameRecord.val;
						if (sameRecord.val < min) min = sameRecord.val;
						if (sameRecord.val > max) max = sameRecord.val;
						count++;
					}
				}
				
			}
			// !!! Мы можем наткнуться на проблему множественных выбросов, когда все числа
			// очень близки друг к другу и сигма их отсечёт ВСЕ
			// ТОгда берём просто первый элемент и считаем min \ max
			if (count == 0){
				// качание 10%
				rec.min = rec.val * 0.9;
				rec.max = rec.val * 1.1;
				
				// если отрицательные - упорядочим
				if (rec.min > rec.max){
					const tmp = rec.max;
					rec.max = rec.min;
					rec.min = tmp;
				}
			}else {
				rec.val = average / count;
				rec.min = min;
				rec.max = max;
			}
		});
	}
	
	
	async addWrists(
		template:TGestureTemplateNeo,
		wrists:TWristDesc[]
	){
		const deviceType:'regular' | 'apple' = await new XRChecker().deviceType();
		this._template  = template;
		
		// Подготовим сырые данные wrist
		// Поменяем так пичи, чтобы меньший всегда был начальным, а лимит большим
		wrists.forEach((wrist)=>{
			if((wrist.initialPitch || 0) > (wrist.limitPitch || Math.PI)){
				const swap = wrist.initialPitch || 0;
				wrist.initialPitch = wrist.limitPitch || Math.PI;
				wrist.limitPitch = swap;
			}
		});
		
		if (wrists.length > 0){
			if (template[deviceType] == undefined){
				template[deviceType] = {
					softness:0.5,
					links:[],
					wrists:wrists
				};
			}else{
				template[deviceType]!.wrists = wrists;
			}
		}
	}
	
	
	protected moveDataToResult(){
		const generate:TJointsLink[] = [];
		const fakePass = this._capturedLinks[0];
		
		fakePass.forEach((rec)=>{
			generate.push(rec);
		});
		
		this._template[this._deviceMode]!.links = generate;
	}
	
	
	// Мержит 2 темлейта. Имя и тип возьмёт из первого операнда
	mergeLinks(
		templateA:TGestureTemplateNeo,
		templateB:TGestureTemplateNeo
	):TGestureTemplateNeo{
		
		const result:TGestureTemplateNeo = {
			name:templateA.name,
			type:templateA.type
		}
		
		const linkPass = (tA:TGestureTemplateNeo, tB:TGestureTemplateNeo, deviceKey:'regular' | 'apple')=>{
			if (tA[deviceKey] && tB[deviceKey]){
				tA[deviceKey]?.links.forEach((aLink)=>{
					const bLink = this.getSameRecordInOtherTemplate(aLink, deviceKey, tB);
					const mixedLink = cloneDeep(aLink);
					if (bLink){
						mixedLink.val   =   (aLink.val + bLink.val) / 2;
						
						//  Усреднение
						mixedLink.min   =   (aLink.min + bLink.min)/2;
						mixedLink.max   =   (aLink.max + bLink.max)/2;
					}
					const resRecord = this.getSameRecordInOtherTemplate(aLink, deviceKey, result);
					if (!resRecord) {
						if (!result[deviceKey]){
							result[deviceKey] = {
								softness:0.5,
								links:[]
							}
						}
						result[deviceKey]!.links.push(mixedLink);
					}else{
						resRecord.val = mixedLink.val;
						resRecord.min = mixedLink.min;
						resRecord.max = mixedLink.max;
					}
				});
			}
		}
		
		
		// Пройдёт по всем записям в шаблонах и добавит если чего-то не было
		linkPass(templateA, templateB, 'regular');
		linkPass(templateA, templateB, 'apple');
		linkPass(templateB, templateA, 'regular');
		linkPass(templateB, templateA, 'apple');
		
		return result;
	}
	
	
	applyWrists(
		templateA:TGestureTemplateNeo,
		templateWithWrists:TGestureTemplateNeo
	):TGestureTemplateNeo{
		const result = cloneDeep(templateA);
		const devices:(keyof Pick<TGestureTemplateNeo, 'regular' | 'apple' >)[] = ['regular', 'apple'];

		devices.forEach((device)=>{
			if(templateWithWrists[device]){
				if(!result[device]) result[device] = {
					softness:0.5,
					links:[],
					wrists:[]
				}
				
				templateWithWrists[device]!.wrists?.forEach((wrist)=>{
					result[device]!.wrists!.push(cloneDeep(wrist));
				});
			}
		});
		
		return result;
	}
	
	
	private getSameRecordInOtherTemplate(
		record:TJointsLink,
		deviceType:'regular' | 'apple',
		template:TGestureTemplateNeo
	):TJointsLink | undefined{
		if (template[deviceType]){
			const links = template[deviceType]?.links;
			if (links){
				return links.find((link)=>{
					return Boolean(
						(record.from.h == link.from.h)
						&& (record.from.id == link.from.id)
						&& (record.to.h == link.to.h)
						&& (record.to.id == link.to.id)
					)
				});
			}
		}
	}
	
}