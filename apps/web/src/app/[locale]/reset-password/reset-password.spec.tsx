import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "./page";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

describe("ResetPasswordPage Unit Tests", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/pt/reset-password?token=mock-token-xyz");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/pt/reset-password");
  });

  test("renders reset message if token is missing", () => {
    window.history.replaceState({}, "", "/pt/reset-password");
    render(<ResetPasswordPage />);
    expect(screen.getByText("Por favor, utilize o link de redefinição enviado para seu e-mail.")).toBeInTheDocument();
  });

  test("renders reset form inputs and strength checklist if token exists", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText("newPasswordPlaceholder")).toBeInTheDocument();
    expect(screen.getByLabelText("confirmNewPasswordPlaceholder")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "resetPasswordTitle" })).toBeInTheDocument();
  });

  test("shows validation checklist items and strength when typing", async () => {
    const user = userEvent.setup();

    render(<ResetPasswordPage />);
    const passwordInput = screen.getByLabelText("newPasswordPlaceholder");

    await user.type(passwordInput, "abc");
    await waitFor(() => {
      expect(screen.getByText("Fraca")).toBeInTheDocument();
    });
  });

  test("displays matching password error validator client-side", async () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText("newPasswordPlaceholder"), {
      target: { value: "ComplexPassword123!" },
    });
    fireEvent.change(screen.getByLabelText("confirmNewPasswordPlaceholder"), {
      target: { value: "DifferentPassword123!" },
    });

    const submitBtn = screen.getByRole("button", { name: "resetPasswordTitle" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    });
  });
});
