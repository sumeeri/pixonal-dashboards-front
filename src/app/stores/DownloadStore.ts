import { action, makeObservable, observable } from 'mobx';

export class DownloadStore {
  public progress: number = 0;
  public time: number = 0;

  constructor() {
    makeObservable(this, {
      progress: observable,
      time: observable,
      setProgress: action,
      setTime: action,
    });
  }

  setProgress(value: number): void {
    this.progress = value;
  }

  setTime(value: number): void {
    this.time = value;
  }
}

const downloadStoreInstance = new DownloadStore();
export default downloadStoreInstance;
