import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "../mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

vi.mock("next/navigation", () => {
  const pushMock = vi.fn();
  const replaceMock = vi.fn();
  return {
    useRouter: () => ({
      push: pushMock,
      replace: replaceMock,
      prefetch: vi.fn(),
    }),
    usePathname: () => "/pt/login",
    useSearchParams: () => new URLSearchParams(window.location.search),
  };
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));
