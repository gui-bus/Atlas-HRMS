import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuditLogsPage from "./page";

import { NuqsAdapter } from "nuqs/adapters/next/app";

// Mock Services
vi.mock("@/services/audit.service", () => ({
  auditService: {
    getAuditLogs: vi.fn().mockResolvedValue({
      data: [
        {
          id: "log-1",
          action: "EMPLOYEE_CREATED",
          details: '{"employeeId":"emp-123"}',
          timestamp: "2026-07-16T12:00:00.000Z",
          user: { email: "admin@atlas.com" },
        },
      ],
      meta: {
        total: 1,
        page: 1,
        lastPage: 1,
        limit: 15,
      },
    }),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "mock-user-123", email: "admin@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

describe("AuditLogsPage integration tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{ui}</NuqsAdapter>
      </QueryClientProvider>,
    );
  };

  test("renders audit logs table", async () => {
    renderWithProviders(<AuditLogsPage />);

    expect(screen.getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("actions.EMPLOYEE_CREATED")).toBeInTheDocument();
      expect(screen.getByText("admin@atlas.com")).toBeInTheDocument();
    });
  });
});
