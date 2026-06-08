export class AbortControllerStore {
  controller = new AbortController();

  constructor() {}

  setAbortRequest() {
    this.controller.abort();
    this.resetController();
  }

  resetController() {
    this.controller = new AbortController();
  }
}

const abortControllerStoreInstance = new AbortControllerStore();
export default abortControllerStoreInstance;
