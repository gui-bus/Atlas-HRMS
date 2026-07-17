import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PositionsPage from "./page";
import NewPositionPage from "./new/page";

vi.mock("nuqs", () => {
  const { useState } = require("react");
  return {
    useQueryState: vi.fn((key, options) => {
      const defaultValue = options?.defaultValue !== undefined ? options.defaultValue : "";
      const [val, setVal] = useState(defaultValue);
      return [val, setVal];
    }),
    parseAsInteger: {
      withDefault: (val: number) => ({ defaultValue: val }),
    },
    parseAsString: {
      withDefault: (val: string) => ({ defaultValue: val }),
    },
  };
});

// Mock Services
vi.mock("@/services/position.service", () => ({
  positionService: {
    getPositions: vi.fn().mockResolvedValue({
      data: [
        {
          id: "pos-1",
          title: "Desenvolvedor Frontend",
          salaryRangeMin: "3000",
          salaryRangeMax: "6000",
          active: true,
          departmentId: "dept-1",
        },
      ],
      totalPages: 1,
    }),
    createPosition: vi.fn().mockResolvedValue({ id: "pos-3" }),
    updatePosition: vi.fn().mockResolvedValue({ id: "pos-1" }),
    deletePosition: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/department.service", () => ({
  departmentService: {
    getDepartments: vi
      .fn()
      .mockResolvedValue([{ id: "dept-1", name: "Tecnologia", code: "TI", active: true }]),
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
    useParams: () => ({ locale: "pt", id: "pos-1" }),
  };
});

describe("Positions Page Tests", () => {
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

  test("renders positions listing page correctly", async () => {
    renderWithProviders(<PositionsPage />);
    expect(screen.getByText("Cargos")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Desenvolvedor Frontend")).toBeInTheDocument();
    });
  });

  test("renders position creation form correctly", async () => {
    renderWithProviders(<NewPositionPage />);
    expect(screen.getByText("Novo Cargo")).toBeInTheDocument();
  });
});
