import { action, makeObservable, observable } from 'mobx';

export class ContentLoadStore {
  isContentLoading = false;
  isTimelineDataLoading = false;
  isSelectedTimePointLoading = false;
  isKpiLoading = false;

  constructor() {
    makeObservable(this, {
      isTimelineDataLoading: observable,
      isContentLoading: observable,
      isKpiLoading: observable,
      setIsContentLoading: action,
      setIsTimelineDataLoading: action,
      isSelectedTimePointLoading: observable,
      setIsSelectedTimePointLoading: action,
      setIsKpiLoading: action,
    });
  }

  setIsTimelineDataLoading(state: boolean) {
    this.isTimelineDataLoading = state;
  }

  setIsContentLoading(state: boolean) {
    this.isContentLoading = state;
  }

  setIsSelectedTimePointLoading(state: boolean) {
    this.isSelectedTimePointLoading = state;
  }

  setIsKpiLoading(state: boolean) {
    this.isKpiLoading = state;
  }
}

const contentLoadStoreInstance = new ContentLoadStore();
export default contentLoadStoreInstance;
