import axios, { AxiosError } from 'axios';
import { setupCache } from 'axios-cache-interceptor';

import errorStoreInstance, { ErrorData } from '../../app/stores/errorStore.ts';
import { AvailablePages } from '../../entities/navigation/types.ts';

interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: any;
  traceId: string;
  message?: string;
}

function getToken() {
  return localStorage.getItem('token');
}

// Use proxy to avoid CORS issues
const BASE_URL = (import.meta.env.VITE_REACT_APP_BASE_URL || window.location.origin) + '/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const axiosCachingInstance = setupCache(axiosInstance);

// Interceptor to add authorization header to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error?.response?.status === 403) {
      window.location.href = AvailablePages.FORBIDDEN;
    }
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
      window.location.replace(`${window.location.origin}/login`);
    }

    if (error?.response?.status) {
      if (error.response.data?.errors) {
        const errors = error.response.data.errors;

        const keys = Object.keys(errors);
        keys.forEach((key) => {
          errors[key].forEach((message: string | undefined) => {
            const errorData = message || 'Unknown error occurred';

            errorStoreInstance.handleError({
              status: error?.response?.status || 400,
              data: { message: errorData } as ErrorData,
            });
          });
        });
      } else {
        const errorData = (error.response.data || {
          message: 'Unknown error occurred',
        }) as ErrorData;

        errorStoreInstance.handleError({
          status: error.response.status,
          data: errorData,
        });
      }
    }

    return Promise.reject(error);
  }
);
