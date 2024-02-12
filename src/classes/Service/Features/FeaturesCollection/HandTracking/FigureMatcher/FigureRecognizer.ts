import {AcquireAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/AcquireAngles';

import {Vector3}                from '@babylonjs/core/Maths/math.vector';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import {WebXRHand}              from '@babylonjs/core/XR/features/WebXRHandTracking';
import {WebXRHandJoint}         from '@babylonjs/core/XR/features/WebXRHandTracking';

import {XRChecker} from '@classes/Service/XRChecker/XRChecker';
import {MatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/MatchingResult';
import {AbstractHandsMeshProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/AbstractHandsMeshProcessor/AbstractHandsMeshProcessor';
import {ReportProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/ReportProcessor/ReportProcessor';
import {MiniReportLoggerFg} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/MiniReportLoggerFg/MiniReportLoggerFg';
import type {IFigureRecognizer} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IFigureRecognizer';
import type {TGestureTemplateNeo, TJointsLink, TWristDesc} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import type {IGesturesRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/IGesturesRepo';
import type {IVector2Like} from '@babylonjs/core/Maths/math.like';
import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {IMatchingResult} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/interfaces/IMatchingResult';
import type {IReportProcessor} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/ReportProcessor/IReportProcessor';
import type {TGestureMatchOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {IMiniReportLoggerFg} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/MiniReportLoggerFg/IMiniReportLoggerFg';
import type {IDebugXRFeature} from '@classes/Service/Features/FeaturesCollection/XRDebug/interfaces/IDebugXRFeature';
import type {TWristAngles} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TWristAngles';
import type {ILogger} from "@classes/Service/Shared/LoggerProvider/ILogger";

// Распознаватель жеста (фигуры пальцев)
export class FigureRecognizer extends AbstractHandsMeshProcessor implements IFigureRecognizer {
	
	protected   _reportProcessor?:IReportProcessor;
	protected   _miniReportLogger?:IMiniReportLoggerFg;
	protected   _deviceType:'regular' | 'apple' = 'regular';
	protected   _debug?:IDebugXRFeature;
	
	constructor(
		protected _helper:WebXRDefaultExperience,
		// в этом месте репозиторий жестов уже отфильтрован по комбинациям
		protected _gesturesRepo:IGesturesRepo,
		protected logger:ILogger,
		protected debugConfig?:TGestureMatchOptions['debugConfig'],
	) {
		super();
		this.logger.log('Figure recognizer', 'info', 'add');
		if (this.debugConfig?.collectReport){
			this._reportProcessor   =   new ReportProcessor();
		}
		
		if(this.debugConfig){
			this._debug = this._helper.baseExperience.featuresManager.getEnabledFeature('xr-debug') as unknown as IDebugXRFeature | undefined;
		}
		
		
		// Мини-репорты периодические
		if (this.debugConfig?.activateMiniReports && this._debug){
			this._miniReportLogger  =   new MiniReportLoggerFg(
				this.debugConfig?.miniReportEveryXms || 5000,
				this.logger,
				this._debug,
				this.debugConfig.slotNameForGesturesInfo
			);
		}
	}
	
	
	async init(){
		this.logger.log('Figure recognizer', 'info', 'init');
		this._deviceType = await new XRChecker().deviceType();
		// await this.appleHook();
		super.init(this._helper);
	}
	
	
	get report():TFigureRecognizeReport | undefined {
		return this._reportProcessor?.report;
	}

	
	// Сравнивает шаблон с жестом. Строка - имя совпавшего жеста
	isAnyGestureMatchedWithFigure():IMatchingResult[]{
		let res:MatchingResult[] = []; //new MatchingResult();
		
		const templateNames = Array.from(this._gesturesRepo.keys());
		
		for(let tn of templateNames){
			const template = this._gesturesRepo.get(tn);
			if(template){
				this._reportProcessor?.incChecks();
				const resDown = this.compareFigureWithTemplate(template);
				if (resDown.isMatch){
					res.push(resDown);
					this._reportProcessor?.incRecognized();
				}
			}
		}
		return res;
	}
	
	
	protected whenHandAppear(h:WebXRHand){
		h.handMesh?.setEnabled(true);
	}
	
	protected whenHandDisappear(h:WebXRHand){
		h.handMesh?.setEnabled(false);
	}
	
	private handTypesRouter = new Map<TGestureTemplateNeo['type'], (template:TGestureTemplateNeo)=>IMatchingResult>([
		['right', this.processLeftOrRightHand.bind(this)],
		['left', this.processLeftOrRightHand.bind(this)],
		['any-hand', this.processAnyHand.bind(this)],
		['both-hand', this.processBothHand.bind(this)]
	]);
	
	// Сравнение фигуры с описанием темплейта
	protected compareFigureWithTemplate(
		template:TGestureTemplateNeo
	):IMatchingResult{
		const processFn = this.handTypesRouter.get(template.type);
		if (processFn){
			return processFn(template);
		}
		return new MatchingResult(template.name);
	}
	
	// правая или левая
	protected processLeftOrRightHand(template:TGestureTemplateNeo):IMatchingResult{
		const res = new MatchingResult(template.name);
		res.isMatch = this.checkRL(template.type as 'right' | 'left', template);
		if (res.isMatch){
			res.hands.push(template.type.substring(0,1) as 'r' | 'l')
		}
		return res;
	}
	
	// любая из рук
	protected processAnyHand(template:TGestureTemplateNeo):IMatchingResult{
		const res = new MatchingResult(template.name);
		const right = this.checkRL('right', template);
		if(right) res.hands.push('r');
		
		// вторая
		const left  =   this.checkRL('left', template); // если нет, проверим другую
		if(left) res.hands.push('l');
		
		res.isMatch         =   left || right;
		return res;
	}
	
	// Обе руки
	protected processBothHand(template:TGestureTemplateNeo):IMatchingResult{
		const res                       =   new MatchingResult(template.name);
		const connections     =   template[this._deviceType];
		
		res.isMatch             =   this.checkWrists(template, ['right', 'left']);
		// wrist вперёд, потому что проверка пройдёт быстрее
		if(res.isMatch) {
			const links = connections?.links;
			if (links){
				res.isMatch     =   this.matchWithLinksPool(template, links);
				res.hands       =   ['r', 'l'];
				return res;
			}
		}else{
			// очистим индикатор
			if(this.debugConfig?.slotForFigureIndicator){
				const val = '[     ]';
				this._debug?.print(this.debugConfig?.slotForFigureIndicator, val);
			}
		}
		return res;
	}
	
	
	// Проверка на одну руку правую или ...левую ))
	private checkRL(key:'right' | 'left', template:TGestureTemplateNeo):boolean{
		let res = false;
		
		// WRIST's
		const wrCheck = this.checkWrists(template, [key]);
		
		if (wrCheck){
			const connections = template[this._deviceType];
			const shortKey = key.substring(0,1);
			const links = connections?.links.filter((link)=>{
				return Boolean(
					(link.from.h == shortKey)
					&& (link.to.h == shortKey)
				);
			});
			if(links){
				res = this.matchWithLinksPool(template, links);
			}
		}
		return res;
	}
	
	
	// Проверит вристы на соовтв. если в них указан флажок проверять углы
	// Если в шаблоне не указано вристов, будет возвращать true
	protected checkWrists(
		template:TGestureTemplateNeo,
		hands:XRHandedness[]
	):boolean{
		const templatePool = template[this._deviceType];
		
		const matchAngle = (axis:'Pitch' | 'Roll', hand:WebXRHand, handIndex:XRHandedness, wristDesc:TWristDesc):boolean=>{
			let res = false;
			const currentAngles = AcquireAngles(hand, handIndex);
			if(currentAngles){
				res = Boolean(
					this.isPitch(wristDesc, currentAngles)
					&& this.isRoll(wristDesc, currentAngles)
				);
				this._reportProcessor?.registerCheckingWrist(template.name, handIndex, axis, res);
			}
			return res;
		}
		
		
		const processHand   =   (handIndex:XRHandedness):boolean=>{
			let ret = true;
			const wristDesc = templatePool?.wrists?.find((w)=>(w.hand == handIndex));
			// если нет описания - вернёт, что всё ок
			if (wristDesc?.useAnglesForDetection){
				const hand = this.getHand(handIndex as 'right' | 'left');
				if (hand){
					ret = Boolean(
						matchAngle('Pitch', hand, handIndex, wristDesc)
						&& matchAngle('Roll', hand, handIndex, wristDesc)
					);
				}
			}
			return ret;
		}
		
		let ret = true;
		for(let handIndex of hands){
			ret = ret && processHand(handIndex);
		}
		return ret;
	}
	
	
	protected matchWithLinksPool(
											template:TGestureTemplateNeo,
											links:TJointsLink[]
	){
		let allIsOk = Boolean(links.length);

		const hands = {
			l:this.getHand('left'),
			r:this.getHand('right')
		}
		
		let matchedLinks = 0;
		for(let i=0; i<links.length; i++){
			const link                =   links[i];
			const jFrom     =   hands[link.from.h]?.getJointMesh(link.from.id as WebXRHandJoint);
			const jTo       =   hands[link.to.h]?.getJointMesh(link.to.id as WebXRHandJoint);
			
			if (jFrom && jTo){
				const vA                =   jFrom.position;
				const vB                =   jTo.position;
				const distance          =   Vector3.Distance(vA, vB);
				
				// обработка диапазона
				const correctedRange = this.scaleRange(
																	{x:link.min, y:link.max},
																	link.weight,
																	template[this._deviceType]?.softness
				);
				
				// попадание или нет
				const linkResult = Boolean((distance < correctedRange.y) && (distance > correctedRange.x));
				
				// отчётность
				this._reportProcessor?.registerChecking(template.name, link, linkResult);
				
				// подсчёт для дебаг
				if(this.debugConfig?.slotForFigureIndicator){
					matchedLinks += Number(linkResult);
				}
				
				if(!linkResult) allIsOk = false;
			}else{
				allIsOk = false;
			}
		}
		
		if(this.debugConfig?.slotForFigureIndicator){
			let val = '[ FIG ]';
			if (!allIsOk){
				val = '[' + ((matchedLinks / links.length) * 100).toFixed(0) + '%]';
			}
			this._debug?.print(this.debugConfig?.slotForFigureIndicator, val);
		}
		
		// докинуть в логгер жестов периодический
		if(allIsOk) this._miniReportLogger?.registerRecognition(template.name);
		return allIsOk;
	}
	
	
	// Определяет ширину диапазонов для разной силы связей
	protected scaleRange(
						range:IVector2Like,
						weight:'h'|'n'|'l'|'ul',
						softness:number = 0.5
	):IVector2Like{
		
		// Для нуля softness
		const kForWeights0          =  {
											ul:0.4,
											l:0.30,
											n:0.20,
											h:0.10
										};
		
		// Для единицы softness
		const kForWeights1          =  {
											ul:0.78,
											l:0.60,
											n:0.43,
											h:0.30
										};
		
		const percentage    =   kForWeights1[weight] + ((kForWeights1[weight] - kForWeights0[weight]) * softness);
		const rangeLength   =   Math.abs(range.x - range.y);
		const adjustment    =   rangeLength * percentage;
		
		return <IVector2Like>{
			x:range.x - adjustment,
			y:range.y + adjustment
		};
	}
	
	
	protected isRoll(wristDesc:TWristDesc, currentAngles: TWristAngles ):boolean{
		const a         =   currentAngles.angleRoll;
		const init      =   wristDesc.initialRoll   ||  0;
		const limit     =   wristDesc.limitRoll     ||  Math.PI * 2;
		let res;
		if(
			// Прямая ситуация, один диапазон
			init < limit
		){
			res = Boolean((a < limit) && (a > init));
		}else{
			// ИЛИ!
			res = Boolean((a > init) || (a < limit));
		}
		
		if(this.debugConfig?.slotForWristIndicatorRoll){
			let val = ' [ ROL ] ';
			if(!res){
				val = 'x' + val + 'x';
			}
			this._debug?.print(this.debugConfig.slotForWristIndicatorRoll, val);
		}
		
		// Два диапазона
		return res;
	}
	
	protected isPitch(wristDesc:TWristDesc, currentAngles: TWristAngles ):boolean{
		const a       =   currentAngles.anglePitch;
		let init      =   wristDesc.initialPitch    ||  0;
		let limit     =   wristDesc.limitPitch      ||  Math.PI * 2;
		
		const res     =   Boolean((a >= init) && (a <= limit));
		
		if(this.debugConfig?.slotForWristIndicatorPitch){
			let val           =   ' [ PIT ] ';
			if(!res){
				if(a < init) val = 'x' + val;
				if(a > limit) val = val + 'x'
			}
			this._debug?.print(this.debugConfig.slotForWristIndicatorPitch, val);
		}
		
		// ситуации когда лимит меньше начального должен устранить темплейт билдер
		return res;
	}
	
	
	
	// Подменяет значения на значения из apple
	/*	private async appleHook(){
		this._isApple = await (new XRChecker().isApple());
	}*/
	
	dispose() {
		this.logger.dispose('FigureRecognizer');
		
		this._reportProcessor?.dispose();
		//@ts-ignore
		this._reportProcessor = null;
		
		this._miniReportLogger?.dispose();
		//@ts-ignore
		this._miniReportLogger = null;
		
		super.dispose();
	}
}