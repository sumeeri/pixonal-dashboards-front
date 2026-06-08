import { axiosCachingInstance, axiosInstance } from 'shared/constants/axiosInstance.ts';

import {
  CreateUserDto,
  CreateUserResponse,
  PaginationData,
  Permission,
  Role,
  UpdateUserDto,
  UserById,
  UserListWithPagination,
} from './types';

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await axiosCachingInstance.get('/Permissions');

  return response?.data;
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await axiosCachingInstance.get('/Roles');

  return response?.data;
};

export const getUsers = async (data: PaginationData): Promise<UserListWithPagination> => {
  const response = await axiosInstance.get('/Users', {
    // @ts-expect-error:next-line
    cache: false,
    params: data,
  });

  return response?.data;
};

export const getUserById = async (id: number): Promise<UserById> => {
  const response = await axiosInstance.get(`/Users/${id}`, {
    // @ts-expect-error:next-line
    cache: false,
  });

  return response?.data;
};

export const createUser = async (data: CreateUserDto): Promise<CreateUserResponse> => {
  const request = await axiosCachingInstance.post('/Users', data);

  return request.data;
};

export const updateUser = async (id: number, data: UpdateUserDto): Promise<{ message: string }> => {
  const request = await axiosCachingInstance.put(`/Users/${id}`, data);

  return request.data;
};

export const updateUserPassword = async (id: number, password: string): Promise<{ message: string }> => {
  const request = await axiosCachingInstance.put(`/Users/changePassword/${id}`, password, {
    headers: { 'Content-Type': 'application/json' },
  });

  return request.data;
};

export const changeUserStatus = async (id: number, active: boolean): Promise<{ message: string }> => {
  const url = active ? `/Users/deactivate/${id}` : `/Users/activate/${id}`;

  const request = await axiosCachingInstance.put(url);

  return request.data;
};

export const generateUserLink = async (id: number): Promise<{ link: string }> => {
  const request = await axiosCachingInstance.post('/Link/generate', { userId: id });

  return request.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  const request = await axiosCachingInstance.delete(`/Users/${id}`);

  return request.data;
};

export const sendUserLink = async (id: number): Promise<{ message: string }> => {
  const request = await axiosCachingInstance.post('/Link/send', { userId: id });

  return request.data;
};
