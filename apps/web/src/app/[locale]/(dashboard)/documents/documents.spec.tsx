import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DocumentsPage from "./page";
import NewDocumentPage from "./new/page";

// Mock Services
vi.mock("@/services/document.service", () => ({
  documentService: {
    getDocuments: vi.fn().mockResolvedValue([
      {
        id: "doc-1",
        name: "Contrato de Admissão - Pedro",
        type: "CONTRACT",
        url: "https://utfs.io/f/contrato.pdf",
        createdAt: "2026-07-16T12:00:00.000Z",
        employee: { firstName: "Pedro", lastName: "Santos", email: "pedro@atlas.com" },
      },
    ]),
    createDocument: vi.fn().mockResolvedValue({ id: "doc-2" }),
    deleteDocument: vi.fn().mockResolvedValue({}),
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
    user: { id: "mock-user-123", email: "admin@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

vi.mock("next/navigation", () => {
  const pushMock = vi.fn();
  return {
    useRouter: () => ({ push: pushMock, back: vi.fn() }),
    useParams: () => ({ locale: "pt" }),
  };
});

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("DocumentsPage integration tests", () => {
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

  test("renders document records table", async () => {
    renderWithProviders(<DocumentsPage />);

    expect(screen.getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Contrato de Admissão - Pedro")).toBeInTheDocument();
      expect(screen.getByText("Pedro Santos")).toBeInTheDocument();
    });
  });

  test("renders upload document form page", async () => {
    renderWithProviders(<NewDocumentPage />);
    expect(screen.getByText("addDocument")).toBeInTheDocument();
  });
});
