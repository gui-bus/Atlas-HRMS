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
    useParams: () => ({ locale: "pt" }),
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

vi.mock("nuqs/adapters/next/app", () => ({
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => children,
}));
