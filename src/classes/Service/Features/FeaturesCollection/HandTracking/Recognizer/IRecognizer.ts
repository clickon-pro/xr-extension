import {Observable} from 'rxjs';

import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import type {IDisposable}       from '@babylonjs/core/scene';

import type {TGestureMatchOptions} from '@classes/Service/Features/FeaturesCollection/HandTracking/Recognizer/TGestureMatchOptions';
import type {TFigureRecognizeReport} from '@classes/Service/Features/FeaturesCollection/HandTracking/FigureMatcher/TFigureRecognizeReport';
import type {TCombinationInfo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsProcessor/ICombinationsProcessor';

export interface IRecognizer extends IDisposable {
	
	readonly gestureCombination$: Observable<TCombinationInfo>;
	
	// Получить отчёт
	// Получить отчёт (надо запрашивать ДО остановки распознавания)
	// report(combinationName:string):TFigureRecognizeReport | undefined;
	
	init(
		helper: WebXRDefaultExperience,
		options?: TGestureMatchOptions,
	): Promise<void>;
	
	setOptions(options: Partial<TGestureMatchOptions>): void;
	
	// Если не указано имя - запустит распознавание по всем репам
	startRecognize(combinationsRepoName?: string): Promise<void>;
	
	// Остановить распознавание
	// Если не указаны конкретный репо - остановит всё
	stopRecognize(combinationsRepoName?: string): TFigureRecognizeReport | undefined;
	
	// Получить все текущие отчёты
	getAllCurrentReports(): { [repName: string]: TFigureRecognizeReport };
	
	// Получить текущий отчёт
	getCurrentReportByName(reportName: string): TFigureRecognizeReport | undefined;
}