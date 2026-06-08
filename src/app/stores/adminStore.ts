import { makeAutoObservable } from 'mobx';

import { getPermissions, getRoles, getUserById, getUsers } from '../../entities/admin/users/api';
import { Permission, Role, UserById, UserListWithPagination } from '../../entities/admin/users/types.ts';

export class AdminStore {
  usersList: UserListWithPagination | null = null;
  permissions: Permission[] = [];
  roles: Role[] = [];

  isCreateUserOpen: boolean = false;

  editableUserData: UserById | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchDictionaries() {
    const [permissions, roles] = await Promise.all([getPermissions(), getRoles()]);
    this.permissions = permissions;
    this.roles = roles;
  }

  async fetchUsers(page: number = 1, pageSize: number = 20) {
    this.usersList = await getUsers({ page, pageSize });
  }

  async fetchUserById(id: number) {
    this.editableUserData = await getUserById(id);
  }

  setIsCreateUserOpen(isCreateUserOpen: boolean) {
    this.isCreateUserOpen = isCreateUserOpen;
  }

  setEditableUserData(data: UserById | null) {
    this.editableUserData = data;
  }
}

const adminStoreInstance = new AdminStore();
export default adminStoreInstance;
