import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./page";
import { expect, test, describe, vi } from "vitest";

describe("ForgotPasswordPage Unit Tests", () => {
  test("renders forgot password form input and button", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText("emailAddress")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sendInstructions" })).toBeInTheDocument();
  });

  test("shows client-side validation errors for invalid email", async () => {
    render(<ForgotPasswordPage />);
    const submitBtn = screen.getByRole("button", { name: "sendInstructions" });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
    });
  });

  test("displays backend error message on failure", async () => {
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("emailAddress"), {
      target: { value: "error@atlas.com" },
    });

    const submitBtn = screen.getByRole("button", { name: "sendInstructions" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("E-mail não cadastrado")).toBeInTheDocument();
    });
  });
});
