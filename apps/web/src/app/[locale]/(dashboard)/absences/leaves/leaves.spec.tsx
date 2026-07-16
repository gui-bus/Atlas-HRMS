import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LeavesAdminPage from "./page";
import NewLeaveRequestPage from "./new/page";

// Mock Services
vi.mock("@/services/vacation.service", () => ({
  vacationService: {
    getLeaves: vi.fn().mockResolvedValue([
      {
        id: "leave-1",
        employeeId: "emp-1",
        type: "MEDICAL",
        startDate: "2026-07-20T00:00:00.000Z",
        endDate: "2026-07-22T00:00:00.000Z",
        reason: "Extração dentária",
        status: "PENDING",
        employee: { firstName: "Gabriel", lastName: "Silva" },
      },
    ]),
    createLeave: vi.fn().mockResolvedValue({ id: "leave-2" }),
    updateLeaveStatus: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/services/employee.service", () => ({
  employeeService: {
    getEmployees: vi.fn().mockResolvedValue({
      data: [{ id: "emp-1", firstName: "Gabriel", lastName: "Silva", email: "gabriel@atlas.com" }],
    }),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "mock-user-123", email: "gabriel@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

vi.mock("next/navigation", () => {
  const pushMock = vi.fn();
  return {
    useRouter: () => ({ push: pushMock, back: vi.fn() }),
    useParams: () => ({ locale: "pt", id: "leave-1" }),
  };
});

describe("Leaves Page Tests", () => {
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

  test("renders leaves control panel page correctly", async () => {
    renderWithProviders(<LeavesAdminPage />);
    expect(screen.getByText("Atestados & Licenças")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Gabriel Silva")).toBeInTheDocument();
    });
  });

  test("renders leave request form correctly", async () => {
    renderWithProviders(<NewLeaveRequestPage />);
    expect(screen.getByText("Solicitar Atestado / Licença")).toBeInTheDocument();
  });
});
