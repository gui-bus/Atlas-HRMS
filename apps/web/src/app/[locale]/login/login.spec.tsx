import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import { expect, test, describe } from "vitest";

describe("LoginPage Integration Tests", () => {
  test("renders login form inputs and button", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("emailAddress")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "signIn" })).toBeInTheDocument();
  });

  test("shows client-side validation errors for invalid inputs", async () => {
    render(<LoginPage />);
    const submitBtn = screen.getByRole("button", { name: "signIn" });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
      expect(screen.getByText("A senha deve conter no mínimo 6 caracteres")).toBeInTheDocument();
    });
  });

  test("handles successful login", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "user@atlas.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "Password123#" },
    });

    const submitBtn = screen.getByRole("button", { name: "signIn" });
    fireEvent.click(submitBtn);

    const { useAuthStore } = await import("@/store/useAuthStore");
    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  test("toggles password visibility", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText("password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("password");
  });

  test("displays backend error message on invalid credentials", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "wrong@atlas.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "wrongpassword" },
    });

    const submitBtn = screen.getByRole("button", { name: "signIn" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });
});
