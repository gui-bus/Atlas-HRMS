import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3001";

export const handlers = [
  // Mock login handler
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as any;

    if (email === "user@atlas.com" && password === "Password123#") {
      return HttpResponse.json({
        user: {
          id: "mock-uuid-1",
          email: "user@atlas.com",
          role: "EMPLOYEE",
        },
        accessToken: "mock-access-token-123",
      });
    }

    return new HttpResponse(
      JSON.stringify({
        message: "Credenciais inválidas",
        error: "Unauthorized",
        statusCode: 401,
      }),
      { status: 401 },
    );
  }),

  // Mock register handler
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { email } = (await request.json()) as any;

    if (email === "existing@atlas.com") {
      return new HttpResponse(
        JSON.stringify({
          message: "E-mail já cadastrado no banco de dados",
          error: "Conflict",
          statusCode: 409,
        }),
        { status: 409 },
      );
    }

    return HttpResponse.json({
      id: "mock-uuid-2",
      email,
      role: "EMPLOYEE",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }),

  // Mock refresh token handler
  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: "mock-refreshed-access-token",
    });
  }),
];
