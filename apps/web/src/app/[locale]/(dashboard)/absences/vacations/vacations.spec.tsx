import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VacationsAdminPage from "./page";
import NewVacationRequestPage from "./new/page";

import { NuqsAdapter } from "nuqs/adapters/next/app";

// Mock Services
vi.mock("@/services/vacation.service", () => ({
  vacationService: {
    getVacations: vi.fn().mockResolvedValue({
      data: [
        {
          id: "vac-1",
          employeeId: "emp-1",
          startDate: "2026-07-20T00:00:00.000Z",
          endDate: "2026-08-03T00:00:00.000Z",
          comments: "Férias anuais planejadas",
          status: "PENDING",
          employee: { firstName: "Gabriel", lastName: "Silva" },
        },
      ],
      totalPages: 1,
    }),
    createVacation: vi.fn().mockResolvedValue({ id: "vac-2" }),
    updateVacationStatus: vi.fn().mockResolvedValue({}),
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
    useParams: () => ({ locale: "pt", id: "vac-1" }),
  };
});

describe("Vacations Page Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
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

  test("renders vacations control panel page correctly", async () => {
    renderWithProviders(<VacationsAdminPage />);
    expect(screen.getByText("vacationsTitle")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Gabriel Silva")).toBeInTheDocument();
    });
  });

  test("renders vacation request form correctly", async () => {
    renderWithProviders(<NewVacationRequestPage />);
    expect(screen.getAllByText("Solicitar Férias")[0]).toBeInTheDocument();
  });
});
