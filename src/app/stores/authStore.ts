import { action, makeObservable, observable } from 'mobx';
import { axiosInstance } from 'shared/constants/axiosInstance';

import { UserPermissions } from '../../entities/admin/users/types';

export class AuthStore {
  isAuth: boolean | null = null;
  error = null;
  isLoading = false;

  permissions: UserPermissions[] | null = localStorage.getItem('permissions')?.split(',') as UserPermissions[];

  constructor() {
    makeObservable(this, {
      isAuth: observable,
      error: observable,
      isLoading: observable,
      authFetch: action,
      authSuccess: action,
      authFailure: action,
      initAuth: action,
    });
  }

  authFetch() {
    this.isAuth = false;
    this.error = null;
    this.isLoading = true;
  }

  authSuccess() {
    this.isAuth = true;
    this.isLoading = false;
  }

  authFailure(error: any) {
    this.isAuth = false;
    this.error = error;
    this.isLoading = false;
  }

  initAuth() {
    const token = localStorage.getItem('token');
    this.isAuth = !!token;
  }

  async checkToken(token: string) {
    try {
      const checkResponse = await axiosInstance.get(`/Access?token=${token}`);

      const authorizationToken = checkResponse.data;

      if (!authorizationToken) {
        return;
      }

      localStorage.setItem('token', authorizationToken);
      this.isAuth = true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
      window.location.replace(`${window.location.origin}/login`);
    }
  }

  setCurrentUserPermissions(permissions: string[]) {
    this.permissions = permissions as UserPermissions[];
  }

  checkUserPermissionForGeometrySlides() {
    const geometrySlides = [
      UserPermissions.LAND_USE,
      UserPermissions.MOBILITY,
      UserPermissions.PEOPLE,
      UserPermissions.TRAFFIC,
    ];

    return !this.permissions?.some((permission) => geometrySlides.includes(permission));
  }
}

const authStoreInstance = new AuthStore();
export default authStoreInstance;
