export type Permission = { id: number; name: string };

export type Role = { id: number; name: string };

export type Link = {
  actual: boolean;
  expireDate: string;
  link: string;
};

export type PaginationData = {
  page: number;
  pageSize: number;
};

export type UserListWithPagination = {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type User = {
  created: string;
  email: string;
  id: number;
  inactive: boolean;
  login: string;
  permissions: string[];
  role: string;
};

export type CreateUserResponse = {
  created: string;
  email: string;
  id: number;
  inactive: boolean;
  login: string;
  permissions: number[];
  roleId: string;
};

export type UserById = {
  created: string;
  email: string;
  id: number;
  inactive: boolean;
  link?: Link;
  login: string;
  permissions: Permission[];
  role: Role;
};

export type CreateUserDto = {
  login: string;
  email: string;
  password: string;
  roleId: number;
  permissionIds: number[];
};

export type UpdateUserDto = {
  login: string;
  email: string;
  link?: string;
  expireDate?: string;
  roleId: number;
  permissionIds: number[];
};

export enum UserTabValues {
  INFO,
  ACCESS,
}

export enum UserPermissions {
  USERS = 'users',
  PEOPLE = 'people',
  MOBILITY = 'mobility',
  LAND_USE = 'landuse',
  TRAFFIC = 'traffic',
}

export interface JwtPayload {
  unique_name: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
}
