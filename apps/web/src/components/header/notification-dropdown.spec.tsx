import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationDropdown } from "./notification-dropdown";


vi.mock("@/services/notification.service", () => ({
  notificationService: {
    getNotifications: vi.fn().mockResolvedValue([
      {
        id: "notif-1",
        message: "Sua solicitação de férias foi aprovada",
        read: false,
        createdAt: "2026-07-16T12:00:00.000Z",
      },
    ]),
    markAsRead: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "mock-user-123", email: "employee@atlas.com", role: "EMPLOYEE" },
    isAuthenticated: true,
  }),
}));

describe("NotificationDropdown unit tests", () => {
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

  test("renders notification badge count when notifications are unread", async () => {
    renderWithProviders(<NotificationDropdown locale="pt" />);
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});
