// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MakeRoomPlan } from "./MakeRoomPlan";
import { planWeekly, zonedToUtc } from "../../lib/time-engine";

describe("Make Room screen for a mama in Toronto", () => {
  it("shows the clock-change note on the week it applies", () => {
    const zone = "America/Toronto";
    const plan = planWeekly({
      firstStart: zonedToUtc(zone, 2026, 10, 21, 13, 0),
      weeks: 4,
      durationMin: 30,
      motherZone: zone,
    });
    render(<MakeRoomPlan plan={plan} zone={zone} />);
    expect(screen.getAllByText(/moves to 12:00 pm, your time/).length).toBeGreaterThan(0);
  });
});
