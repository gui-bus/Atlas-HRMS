declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    JWT_REFRESH_SECRET?: string;
    JWT_REFRESH_EXPIRES_IN?: string;
    FRONTEND_URL?: string;
    NODE_ENV?: "development" | "production" | "test";
  }
}
