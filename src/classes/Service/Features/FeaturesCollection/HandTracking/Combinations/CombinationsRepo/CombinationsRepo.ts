import {Repo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/Repo/Repo';
import type {ICombinationsRepo} from '@classes/Service/Features/FeaturesCollection/HandTracking/Combinations/CombinationsRepo/ICombinationsRepo';
import type {TGestureCombination} from '@classes/Service/Features/FeaturesCollection/HandTracking/Share/TGestureCombination';



export class CombinationsRepo extends Repo<TGestureCombination> implements ICombinationsRepo {}