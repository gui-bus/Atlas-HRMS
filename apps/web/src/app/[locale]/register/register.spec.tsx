import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { expect, test, describe } from "vitest";

describe("RegisterPage Integration Tests", () => {
  test("renders register form inputs and button", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("emailAddress")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(screen.getByLabelText("confirmPassword")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "signUp" })).toBeInTheDocument();
  });

  test("shows client-side validation errors for invalid inputs", async () => {
    render(<RegisterPage />);
    const submitBtn = screen.getByRole("button", { name: "signUp" });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
      expect(screen.getByText("A senha deve conter no mínimo 8 caracteres")).toBeInTheDocument();
    });
  });

  test("shows validation error if passwords do not match", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "test@atlas.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "Password123#" },
    });
    fireEvent.change(screen.getByLabelText("confirmPassword"), {
      target: { value: "DifferentPassword123#" },
    });

    const submitBtn = screen.getByRole("button", { name: "signUp" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    });
  });

  test("handles successful registration", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "newuser@atlas.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "Password123#" },
    });
    fireEvent.change(screen.getByLabelText("confirmPassword"), {
      target: { value: "Password123#" },
    });

    const submitBtn = screen.getByRole("button", { name: "signUp" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Conta criada com sucesso! Redirecionando para o login..."),
      ).toBeInTheDocument();
    });
  });
});
