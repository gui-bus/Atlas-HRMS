import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "../mocks/server";

// Estabelece o Mock Service Worker para capturar requisições de rede
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Reseta qualquer handler de tempo de execução adicionado durante os testes individuais
afterEach(() => server.resetHandlers());

// Finaliza o servidor após todos os testes terminarem
afterAll(() => server.close());

// Mock do next/navigation para o ambiente de testes jsdom
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
    useSearchParams: () => ({
      get: vi.fn((key: string) => null),
    }),
  };
});

// Mock do next-intl para não precisar carregar arquivos de tradução reais
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
