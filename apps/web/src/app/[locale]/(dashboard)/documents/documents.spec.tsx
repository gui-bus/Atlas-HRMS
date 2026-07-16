import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DocumentsPage from "./page";

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

  test("opens dialog and uploads a new document record", async () => {
    renderWithProviders(<DocumentsPage />);

    const openBtn = screen.getByRole("button", { name: "addDocument" });
    fireEvent.click(openBtn);

    expect(screen.getByRole("heading", { name: "addDocument" })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/form\.name/i), { target: { value: "RG Pedro" } });
    fireEvent.change(screen.getByLabelText(/form\.url/i), {
      target: { value: "https://utfs.io/f/rg.pdf" },
    });

    const submitBtn = screen.getByRole("button", { name: "form.create" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByText("RG Pedro")).not.toBeInTheDocument();
    });
  });
});
