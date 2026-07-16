import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AbsencesDashboardPage from "./page";
import MyRequestsPage from "./my-requests/page";

// Mock Services
vi.mock("@/services/vacation.service", () => ({
  vacationService: {
    getVacations: vi.fn().mockResolvedValue([
      {
        id: "vac-1",
        employeeId: "emp-1",
        startDate: "2026-12-20T00:00:00.000Z",
        endDate: "2027-01-10T00:00:00.000Z",
        status: "PENDING",
        comments: "Férias de fim de ano",
        employee: { firstName: "Pedro", lastName: "Santos", email: "pedro@atlas.com" },
      },
    ]),
    getLeaves: vi.fn().mockResolvedValue([
      {
        id: "leave-1",
        employeeId: "emp-1",
        type: "MEDICAL",
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: "2026-08-03T00:00:00.000Z",
        reason: "Extração de siso",
        status: "APPROVED",
        employee: { firstName: "Pedro", lastName: "Santos", email: "pedro@atlas.com" },
      },
    ]),
    getEmployeeVacations: vi.fn().mockResolvedValue([
      {
        id: "vac-1",
        employeeId: "emp-1",
        startDate: "2026-12-20T00:00:00.000Z",
        endDate: "2027-01-10T00:00:00.000Z",
        status: "PENDING",
        comments: "Férias de fim de ano",
      },
    ]),
    getEmployeeLeaves: vi.fn().mockResolvedValue([
      {
        id: "leave-1",
        employeeId: "emp-1",
        type: "MEDICAL",
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: "2026-08-03T00:00:00.000Z",
        reason: "Extração de siso",
        status: "APPROVED",
      },
    ]),
    createVacation: vi.fn().mockResolvedValue({ id: "vac-2" }),
    createLeave: vi.fn().mockResolvedValue({ id: "leave-2" }),
    updateVacationStatus: vi.fn().mockResolvedValue({}),
    updateLeaveStatus: vi.fn().mockResolvedValue({}),
    cancelVacation: vi.fn().mockResolvedValue({}),
    cancelLeave: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/services/employee.service", () => ({
  employeeService: {
    getEmployees: vi.fn().mockResolvedValue({
      data: [{ id: "emp-1", firstName: "Pedro", lastName: "Santos", email: "pedro@atlas.com" }],
    }),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "user-1", email: "pedro@atlas.com", role: "EMPLOYEE" },
  }),
}));

describe("Absences Management Tests", () => {
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
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  test("Dashboard: renders lists of vacation and leave requests", async () => {
    renderWithProviders(<AbsencesDashboardPage />);

    expect(screen.getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Pedro Santos")[0]).toBeInTheDocument();
      expect(screen.getByText("Férias de fim de ano")).toBeInTheDocument();
      expect(screen.getByText("Extração de siso")).toBeInTheDocument();
    });
  });

  test("MyRequests: renders employee history and submits a new request", async () => {
    renderWithProviders(<MyRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText("Férias de fim de ano")).toBeInTheDocument();
      expect(screen.getByText("Extração de siso")).toBeInTheDocument();
    });

    // Form inputs exist
    expect(screen.getByText("addVacation")).toBeInTheDocument();
    expect(screen.getByText("addLeave")).toBeInTheDocument();
  });
});
