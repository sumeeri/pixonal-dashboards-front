import { makeAutoObservable } from 'mobx';

// TODO: remove store completely and use window.location
export class MobilityOverviewPanelStore {
  isPanelOpen = true;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setIsPanelOpen(value: boolean) {
    this.isPanelOpen = value;
  }
}

const mobilityOverviewPanelStoreInstance = new MobilityOverviewPanelStore();
export default mobilityOverviewPanelStoreInstance;
