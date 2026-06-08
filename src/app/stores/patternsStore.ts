import { action, makeObservable, observable, runInAction } from 'mobx';

import { fetchPatterns } from '../../entities/dashboard/services';
import { Pattern, PatternsData } from '../../entities/dashboard/types';

export class PatternsStore {
  patterns: PatternsData[] = [];

  patternsMap = new Map<string, Pattern[]>();

  constructor() {
    makeObservable(this, {
      loadPatterns: action,
      patternsMap: observable,
    });
  }

  async loadPatterns() {
    const patternsResponse = await fetchPatterns();

    runInAction(() => {
      this.patterns = patternsResponse;
    });

    this.createPatternsMap();
  }

  createPatternsMap() {
    for (const { type, patterns } of this.patterns) {
      this.patternsMap.set(type, patterns);
    }
  }
}

const patternsStoreInstance = new PatternsStore();
export default patternsStoreInstance;
