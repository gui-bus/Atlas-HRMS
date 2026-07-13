import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true, // Permite envio automático de cookies (refresh token)
});

// Interceptor de requisições: anexa o Access Token se presente em memória
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

// Interceptor de respostas: trata expirações de token de forma transparente (refresh silencioso)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evita loops infinitos caso a rota de refresh falhe, a requisição seja de login, ou já tenha sido tentada
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        // Solicita a rota de renovação de tokens
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data;

        // Decodifica o payload do Access Token recebido para reconstruir o objeto do usuário logado
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
          // Salva os dados atualizados no Zustand store
          useAuthStore.getState().setAuth(user, accessToken);

          // Atualiza o cabeçalho da requisição original e a executa novamente
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se a renovação falhar, limpa o estado de autenticação e redireciona para a tela de login
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
