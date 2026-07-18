import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DepartmentsPage from "./page";
import NewDepartmentPage from "./new/page";

import { NuqsAdapter } from "nuqs/adapters/next/app";

// Mock Services
vi.mock("@/services/department.service", () => ({
  departmentService: {
    getDepartments: vi.fn().mockResolvedValue({
      data: [
        { id: "dept-1", name: "Tecnologia", code: "TI", active: true, employeesCount: 5 },
        { id: "dept-2", name: "Recursos Humanos", code: "RH", active: false, employeesCount: 2 },
      ],
      totalPages: 1,
    }),
    createDepartment: vi
      .fn()
      .mockResolvedValue({ id: "dept-3", name: "Vendas", code: "VD", active: true }),
    updateDepartment: vi
      .fn()
      .mockResolvedValue({ id: "dept-1", name: "Tecnologia e Inovação", code: "TI", active: true }),
    deleteDepartment: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "mock-user-123", email: "admin@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

vi.mock("next/navigation", () => {
  const pushMock = vi.fn();
  return {
    useRouter: () => ({ push: pushMock, back: vi.fn() }),
    useParams: () => ({ locale: "pt", id: "dept-1" }),
  };
});

describe("Departments Page Tests", () => {
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

  test("renders departments listing page correctly", async () => {
    renderWithProviders(<DepartmentsPage />);
    expect(screen.getByText("departmentsTitle")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Tecnologia")).toBeInTheDocument();
      expect(screen.getByText("Recursos Humanos")).toBeInTheDocument();
    });
  });

  test("renders department registration form correctly", async () => {
    renderWithProviders(<NewDepartmentPage />);
    expect(screen.getByText("Novo Departamento")).toBeInTheDocument();
  });
});
