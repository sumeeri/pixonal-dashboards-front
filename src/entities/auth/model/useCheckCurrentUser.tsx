import { jwtDecode } from 'jwt-decode';
import { axiosInstance } from 'shared/constants/axiosInstance.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import authStoreInstance from '../../../app/stores/authStore.ts';
import { JwtPayload } from '../../admin/users/types.ts';

export function useCheckCurrentUser() {
  const { currentUserStore } = useStore();

  const getTokenPayload = () => {
    const token = localStorage.getItem('token');

    if (token) {
      return jwtDecode<JwtPayload>(token);
    }
  };

  const fetchCurrentUser = async () => {
    const response = await axiosInstance.get('/Users/check');

    authStoreInstance.setCurrentUserPermissions(response.data ?? null);
    localStorage.setItem('permissions', response.data);

    const userData = getTokenPayload();

    if (userData) {
      currentUserStore.setUserData(userData);
    }
  };

  const getCurrentUser = async () => {
    try {
      await fetchCurrentUser();
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
      window.location.replace(`${window.location.origin}/login`);
    }
  };

  return { getCurrentUser };
}
