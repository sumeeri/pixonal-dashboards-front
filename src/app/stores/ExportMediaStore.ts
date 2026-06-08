import { makeAutoObservable } from 'mobx';

export class ExportMediaStore {
  isModalOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsModalOpen(value: boolean) {
    this.isModalOpen = value;
  }
}

const exportMediaStoreInstance = new ExportMediaStore();
export default exportMediaStoreInstance;
