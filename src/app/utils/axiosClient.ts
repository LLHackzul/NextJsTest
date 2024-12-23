import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const axiosClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', 
  timeout: 5000, 
});

let token: string | null = null;

export const setAuthToken = (newToken: string) => {
  token = newToken;
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error) 
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('Error en la respuesta:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;
