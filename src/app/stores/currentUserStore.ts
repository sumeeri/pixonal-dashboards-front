import { action, makeObservable, observable } from 'mobx';

import { JwtPayload } from '../../entities/admin/users/types';

export class CurrentUserStore {
  public userData: JwtPayload | null = null;

  constructor() {
    makeObservable(this, {
      userData: observable,
      setUserData: action,
    });
  }

  public setUserData(data: JwtPayload) {
    this.userData = data;
  }
}

const currentUserStoreInstance = new CurrentUserStore();
export default currentUserStoreInstance;
