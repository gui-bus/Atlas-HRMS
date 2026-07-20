import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true, 
});


api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data;

        
        let user = useAuthStore.getState().user;
        if (accessToken) {
          try {
            const payloadBase64 = accessToken.split(".")[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            user = {
              id: decodedPayload.sub,
              email: decodedPayload.email,
              role: decodedPayload.role,
              isActive: true,
              createdAt: "",
              updatedAt: "",
            };
          } catch (e) {
            console.error("Erro ao decodificar token retornado no refresh", e);
          }
        }

        if (user && accessToken) {
          
          useAuthStore.getState().setAuth(user, accessToken);

          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
