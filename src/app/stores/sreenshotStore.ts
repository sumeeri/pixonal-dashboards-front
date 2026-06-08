import { action, makeObservable, observable } from 'mobx';

export class ScreenshotStore {
  isModalOpen = false;

  constructor() {
    makeObservable(this, {
      isModalOpen: observable,
      setIsModalOpen: action,
    });
  }

  setIsModalOpen(value: boolean) {
    this.isModalOpen = value;
  }
}

const screenshotStoreInstance = new ScreenshotStore();
export default screenshotStoreInstance;
