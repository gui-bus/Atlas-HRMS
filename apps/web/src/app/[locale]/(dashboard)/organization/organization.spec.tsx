import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrganizationPage from "./page";

// Mock Services
vi.mock("@/services/department.service", () => ({
  departmentService: {
    getDepartments: vi.fn().mockResolvedValue([
      { id: "dept-1", name: "Tecnologia", code: "TI", active: true, employeesCount: 5 },
      { id: "dept-2", name: "Recursos Humanos", code: "RH", active: false, employeesCount: 2 },
    ]),
    createDepartment: vi
      .fn()
      .mockResolvedValue({ id: "dept-3", name: "Vendas", code: "VD", active: true }),
    updateDepartment: vi
      .fn()
      .mockResolvedValue({ id: "dept-1", name: "Tecnologia e Inovação", code: "TI", active: true }),
    deleteDepartment: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/position.service", () => ({
  positionService: {
    getPositions: vi.fn().mockResolvedValue([
      {
        id: "pos-1",
        title: "Desenvolvedor Frontend",
        salaryRangeMin: "3000",
        salaryRangeMax: "6000",
        active: true,
        departmentId: "dept-1",
      },
      {
        id: "pos-2",
        title: "Recrutador Junior",
        salaryRangeMin: "2500",
        salaryRangeMax: "4000",
        active: true,
        departmentId: "dept-2",
      },
    ]),
    createPosition: vi
      .fn()
      .mockResolvedValue({
        id: "pos-3",
        title: "Analista de Vendas",
        salaryRangeMin: "3000",
        salaryRangeMax: "5000",
        active: true,
        departmentId: "dept-1",
      }),
    updatePosition: vi
      .fn()
      .mockResolvedValue({
        id: "pos-1",
        title: "Desenvolvedor Senior",
        salaryRangeMin: "7000",
        salaryRangeMax: "12000",
        active: true,
        departmentId: "dept-1",
      }),
    deletePosition: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/employee.service", () => ({
  employeeService: {
    getEmployees: vi.fn().mockResolvedValue({
      data: [
        { id: "emp-1", firstName: "João", lastName: "Silva", email: "joao@atlas.com" },
        { id: "emp-2", firstName: "Maria", lastName: "Souza", email: "maria@atlas.com" },
      ],
    }),
  },
}));

describe("OrganizationPage", () => {
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

  test("renders tables for departments and positions with retrieved data", async () => {
    renderWithProviders(<OrganizationPage />);

    // Check title rendering
    expect(screen.getByText("title")).toBeInTheDocument();

    // Check departments rendering
    await waitFor(() => {
      expect(screen.getByText("Tecnologia")).toBeInTheDocument();
      expect(screen.getByText("RH")).toBeInTheDocument();
    });

    // Check positions rendering
    await waitFor(() => {
      expect(screen.getByText("Desenvolvedor Frontend")).toBeInTheDocument();
      expect(screen.getByText("Recrutador Junior")).toBeInTheDocument();
    });
  });

  test("opens department creation modal and submits form", async () => {
    renderWithProviders(<OrganizationPage />);

    // Click on create department button
    const addDeptBtn = screen.getByRole("button", { name: /addDepartment/i });
    fireEvent.click(addDeptBtn);

    // Dialog title should be shown
    expect(screen.getByRole("heading", { name: "addDepartment" })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/form\.name/i), { target: { value: "Financeiro" } });
    fireEvent.change(screen.getByLabelText(/form\.code/i), { target: { value: "FIN" } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /form\.create/i });
    fireEvent.click(submitBtn);

    // Wait for it to close
    await waitFor(() => {
      expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
    });
  });
});
