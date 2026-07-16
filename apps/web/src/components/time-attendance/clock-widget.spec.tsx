import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClockWidget } from "./clock-widget";

// Mock Services
vi.mock("@/services/time-attendance.service", () => ({
  timeAttendanceService: {
    getTodayRecords: vi
      .fn()
      .mockResolvedValue([
        { id: "rec-1", type: "ENTRY", timestamp: "2026-07-16T08:00:00.000Z", source: "WEB" },
      ]),
    getHourBankBalance: vi.fn().mockResolvedValue(120),
    clockIn: vi.fn().mockResolvedValue({ id: "rec-2", type: "INTERVAL_OUT" }),
  },
}));

describe("ClockWidget Unit Tests", () => {
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

  test("renders clock widget with digital clock and lists today records", async () => {
    renderWithProviders(<ClockWidget />);

    expect(screen.getByText("Ponto Eletrônico")).toBeInTheDocument();
    expect(screen.getByText("Banco de Horas Acumulado")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Entrada")).toBeInTheDocument();
      expect(screen.getByText("+02h 00m")).toBeInTheDocument(); // 120 mins = +02h 00m
    });
  });
});
