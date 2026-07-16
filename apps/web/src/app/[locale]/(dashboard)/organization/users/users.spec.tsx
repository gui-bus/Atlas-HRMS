import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserAccountsPage from "./page";

// Mock Services
vi.mock("@/services/user-account.service", () => ({
  userAccountService: {
    getUserAccounts: vi.fn().mockResolvedValue([
      {
        id: "usr-1",
        email: "admin@atlas.com",
        role: "ADMIN",
        createdAt: "2026-07-16T12:00:00.000Z",
      },
      {
        id: "usr-2",
        email: "employee@atlas.com",
        role: "EMPLOYEE",
        createdAt: "2026-07-16T12:00:00.000Z",
      },
    ]),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "mock-user-123", email: "admin@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

describe("UserAccountsPage integration tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  test("renders user accounts table and lists accounts", async () => {
    renderWithProviders(<UserAccountsPage />);

    expect(screen.getByText("Contas de Usuário")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("admin@atlas.com")).toBeInTheDocument();
      expect(screen.getByText("employee@atlas.com")).toBeInTheDocument();
    });
  });
});
