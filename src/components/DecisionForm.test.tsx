import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionForm } from "./DecisionForm";

function setup(overrides: Partial<Parameters<typeof DecisionForm>[0]> = {}) {
  const onEvaluate = vi.fn();
  const onCreateProfile = vi.fn();
  render(
    <DecisionForm
      disabled={false}
      hasProfile
      onEvaluate={onEvaluate}
      onCreateProfile={onCreateProfile}
      {...overrides}
    />,
  );
  return { onEvaluate, onCreateProfile };
}

describe("DecisionForm", () => {
  it("associates labels with inputs (accessibility)", () => {
    setup();
    expect(screen.getByLabelText(/what are you deciding/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/opportunity details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reference url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/desired outcome/i)).toBeInTheDocument();
  });

  it("shows a friendly error and does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    const { onEvaluate } = setup();
    await user.click(screen.getByRole("button", { name: /evaluate/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/title/i);
    expect(onEvaluate).not.toHaveBeenCalled();
  });

  it("submits a valid decision", async () => {
    const user = userEvent.setup();
    const { onEvaluate } = setup();
    await user.type(
      screen.getByLabelText(/what are you deciding/i),
      "Enter hackathon",
    );
    await user.type(
      screen.getByLabelText(/opportunity details/i),
      "Build an AI app on AWS this weekend.",
    );
    await user.click(screen.getByRole("button", { name: /evaluate/i }));
    expect(onEvaluate).toHaveBeenCalledTimes(1);
    expect(onEvaluate.mock.calls[0]?.[0].title).toBe("Enter hackathon");
  });

  it("supports keyboard navigation across fields", async () => {
    const user = userEvent.setup();
    setup();
    const title = screen.getByLabelText(/what are you deciding/i);
    title.focus();
    expect(title).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/opportunity details/i)).toHaveFocus();
  });

  it("rejects an invalid URL with a friendly message", async () => {
    const user = userEvent.setup();
    const { onEvaluate } = setup();
    await user.type(
      screen.getByLabelText(/what are you deciding/i),
      "Title here",
    );
    await user.type(
      screen.getByLabelText(/opportunity details/i),
      "A description.",
    );
    await user.type(screen.getByLabelText(/reference url/i), "not-a-url");
    await user.click(screen.getByRole("button", { name: /evaluate/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/url/i);
    expect(onEvaluate).not.toHaveBeenCalled();
  });
});
