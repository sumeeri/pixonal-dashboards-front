import { axiosInstance } from 'shared/constants/axiosInstance.ts';

export const userLogin = async (login: string, password: string, authStore: any) => {
  try {
    authStore.authFetch();
    const response = await axiosInstance.post('/Users/token', {
      login,
      password,
    });
    if (response.data) {
      localStorage.setItem('token', response.data);
      authStore.authSuccess();
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    authStore.authFailure(error.response.data.error);
    throw error;
  }
};
