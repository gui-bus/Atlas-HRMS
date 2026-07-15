import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Flow", () => {
  test("should load login page and show validation errors on empty submit", async ({ page }) => {
    await page.goto("/pt/login");
    await expect(page.locator("button[type='submit']")).toBeVisible();

    await page.click("button[type='submit']");

    await expect(page.locator("text=E-mail inválido")).toBeVisible();
    await expect(page.locator("text=A senha deve conter no mínimo 6 caracteres")).toBeVisible();
  });

  test("should navigate smoothly between login and register pages", async ({ page }) => {
    await page.goto("/pt/login");

    const signUpLink = page.locator("a[href*='/register']");
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();

    await expect(page).toHaveURL(/\/register$/);

    const signInLink = page.locator("a[href*='/login']");
    await expect(signInLink).toBeVisible();
    await signInLink.click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("should login successfully and redirect to dashboard", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "1", email: "user@atlas.com", role: "EMPLOYEE" },
          accessToken: "token123",
        }),
      });
    });

    await page.goto("/pt/login");

    await page.fill("input[type='email']", "user@atlas.com");
    await page.fill("input[type='password']", "Password123#");
    await page.click("button[type='submit']");

    await expect(page).toHaveURL(/\/pt$/);
  });

  test("should display API error message on login failure", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Credenciais inválidas",
        }),
      });
    });

    await page.goto("/pt/login");

    await page.fill("input[type='email']", "wrong@atlas.com");
    await page.fill("input[type='password']", "wrongpassword");
    await page.click("button[type='submit']");

    await expect(page.locator("text=Credenciais inválidas")).toBeVisible();
  });

  test("should toggle password field visibility type", async ({ page }) => {
    await page.goto("/pt/login");

    const passwordInput = page.locator("input[name='password']");
    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = page.locator("button:has(svg.lucide-eye)");
    await toggleBtn.click();

    await expect(passwordInput).toHaveAttribute("type", "text");

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should request password reset instructions successfully and show countdown", async ({ page }) => {
    await page.route("**/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Token enviado para o e-mail informado",
        }),
      });
    });

    await page.goto("/pt/forgot-password");
    await page.fill("input[type='email']", "user@atlas.com");
    await page.click("button[type='submit']");

    await expect(page.locator("text=Instruções enviadas com sucesso! Verifique seu e-mail.")).toBeVisible();
    await expect(page.locator("text=Você será redirecionado para a tela de login")).toBeVisible();
  });

  test("should render reset-password page and submit password reset request successfully", async ({ page }) => {
    await page.route("**/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Senha alterada com sucesso",
        }),
      });
    });

    await page.goto("/pt/reset-password?token=mock-token-xyz");

    const newPassword = page.locator("input[id='password']");
    const confirmPassword = page.locator("input[id='confirmPassword']");

    await newPassword.fill("ComplexPassword123!");
    await confirmPassword.fill("ComplexPassword123!");

    await page.click("button[type='submit']");

    await expect(page.locator("text=Senha alterada com sucesso")).toBeVisible();
  });
});
