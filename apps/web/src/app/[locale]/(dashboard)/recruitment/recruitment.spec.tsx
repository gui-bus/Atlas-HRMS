import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecruitmentListPage from "./page";
import NewVacancyPage from "./new/page";
import RecruitmentDetailsPage from "./[id]/page";

// Mock Services
vi.mock("@/services/recruitment.service", () => ({
  recruitmentService: {
    getRecruitments: vi.fn().mockResolvedValue({
      data: [
        {
          id: "job-1",
          title: "Desenvolvedor Backend NestJS",
          slug: "desenvolvedor-backend-nestjs",
          workModel: "REMOTE",
          status: "OPEN",
          department: { name: "Tecnologia" },
        },
      ],
    }),
    getRecruitment: vi.fn().mockResolvedValue({
      id: "job-1",
      title: "Desenvolvedor Backend NestJS",
      slug: "desenvolvedor-backend-nestjs",
      workModel: "REMOTE",
      status: "OPEN",
      department: { name: "Tecnologia" },
    }),
    createRecruitment: vi.fn().mockResolvedValue({ id: "job-2" }),
    deleteRecruitment: vi.fn().mockResolvedValue({}),
    getApplications: vi.fn().mockResolvedValue({
      data: [
        {
          id: "app-1",
          candidateName: "Carlos Souza",
          candidateEmail: "carlos@gmail.com",
          resumeUrl: "https://utfs.io/f/cv.pdf",
          status: "SUBMITTED",
        },
      ],
    }),
    updateApplicationStatus: vi.fn().mockResolvedValue({}),
    hireCandidate: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/services/department.service", () => ({
  departmentService: {
    getDepartments: vi
      .fn()
      .mockResolvedValue([{ id: "dept-1", name: "Tecnologia", code: "TI", active: true }]),
  },
}));

vi.mock("@/services/position.service", () => ({
  positionService: {
    getPositions: vi
      .fn()
      .mockResolvedValue([{ id: "pos-1", title: "Desenvolvedor Backend", active: true }]),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "user-1", email: "pedro@atlas.com", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "job-1", locale: "pt" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

describe("Recruitment & Selection module tests", () => {
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

  test("List: renders ATS open vacancies lists", async () => {
    renderWithProviders(<RecruitmentListPage />);

    expect(screen.getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Desenvolvedor Backend NestJS")).toBeInTheDocument();
    });
  });

  test("New: renders creation form elements", async () => {
    renderWithProviders(<NewVacancyPage />);

    expect(screen.getByText("addJob")).toBeInTheDocument();
    expect(screen.getByLabelText(/form\.title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/form\.description/i)).toBeInTheDocument();
  });

  test("Details: renders candidates Kanban stages", async () => {
    renderWithProviders(<RecruitmentDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Carlos Souza")).toBeInTheDocument();
      expect(screen.getByText("carlos@gmail.com")).toBeInTheDocument();
    });
  });
});
