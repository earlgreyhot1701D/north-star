import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlignmentGauge } from "./AlignmentGauge";

describe("AlignmentGauge", () => {
  it("exposes the score and label to assistive tech", () => {
    render(<AlignmentGauge score={92} label="Excellent Match" />);
    const gauge = screen.getByRole("img");
    expect(gauge).toHaveAttribute(
      "aria-label",
      expect.stringContaining("92 out of 100"),
    );
    expect(gauge.getAttribute("aria-label")).toContain("Excellent Match");
  });

  it("clamps out-of-range scores in the rendered value", () => {
    render(<AlignmentGauge score={150} label="Excellent Match" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});
