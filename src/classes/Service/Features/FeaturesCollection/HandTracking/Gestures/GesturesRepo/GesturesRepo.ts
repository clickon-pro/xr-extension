import type {IGesturesRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Gestures/GesturesRepo/IGesturesRepo';
import type {TGestureTemplateNeo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureTemplate';
import {Repo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/Repo/Repo';


export class GesturesRepo extends Repo<TGestureTemplateNeo> implements IGesturesRepo {

}