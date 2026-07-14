import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Flow", () => {
  test("should load login page and show validation errors on empty submit", async ({ page }) => {
    await page.goto("/pt/login");

    // O tradutor mockado de testes só existiria no vitest. Em ambiente real, o next-intl resolve as chaves normais.
    // Portanto, procuramos por elementos chave como labels, inputs ou botões.
    await expect(page.locator("button[type='submit']")).toBeVisible();

    await page.click("button[type='submit']");

    // Mensagens de validação do Zod devem aparecer em tela
    await expect(page.locator("text=E-mail inválido")).toBeVisible();
    await expect(page.locator("text=A senha deve conter no mínimo 6 caracteres")).toBeVisible();
  });

  test("should navigate smoothly between login and register pages", async ({ page }) => {
    await page.goto("/pt/login");

    // Localiza e clica no link para criar conta
    const signUpLink = page.locator("a[href*='/register']");
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();

    await expect(page).toHaveURL(/\/register$/);

    // Localiza e clica no link para fazer login
    const signInLink = page.locator("a[href*='/login']");
    await expect(signInLink).toBeVisible();
    await signInLink.click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
