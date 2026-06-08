import { makeAutoObservable } from 'mobx';
import { enqueueSnackbar, SnackbarKey } from 'notistack';

export type ErrorData = { message: string };

type Error = { status: number; data: ErrorData };

export class ErrorStore {
  errorLog = new Map<SnackbarKey, string>();

  constructor() {
    makeAutoObservable(this);
  }

  handleError(error: Error) {
    const message = `${error?.status} | ${error?.data?.message}`;
    const key = enqueueSnackbar(message, {
      autoHideDuration: 10000,
      // autoHideDuration: 0,
      // preventDuplicate: true,
      variant: 'error',
    });

    this.errorLog.set(key, message);
  }

  getErrorMessage(key: SnackbarKey) {
    return this.errorLog.get(key);
  }
}

const errorStoreInstance = new ErrorStore();
export default errorStoreInstance;
