import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("displays backend error message on duplicate email registration", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "existing@atlas.com" },
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
      expect(screen.getByText("E-mail já cadastrado no banco de dados")).toBeInTheDocument();
    });
  });

  test("shows password strength meter when typing", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText("password");

    await user.type(passwordInput, "abc");
    await waitFor(() => {
      expect(screen.queryByText("Força da Senha:")).toBeInTheDocument();
      expect(screen.queryByText("Fraca")).toBeInTheDocument();
    });

    await user.clear(passwordInput);
    await user.type(passwordInput, "Password123#");
    await waitFor(() => {
      expect(screen.queryByText("Forte")).toBeInTheDocument();
    });
  });
});
