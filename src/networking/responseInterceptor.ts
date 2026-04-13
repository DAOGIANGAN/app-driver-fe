// import { ref } from 'firebase/storage';
import { navigate } from '../navigation/NavigationService';
import TokenService from '../services/token.service';
import apiClient from './apiclient';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const setupResponseInterceptor = () => {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        error.response?.data.accessTokenInvalid === true
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await TokenService.getRefreshToken();

          const res = await apiClient.get('/refresh-token/refresh-token', {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;
          await TokenService.saveTokens(newAccessToken, newRefreshToken);

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          navigate('Login');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupResponseInterceptor;
