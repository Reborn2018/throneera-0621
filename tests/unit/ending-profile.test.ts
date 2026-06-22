import { describe, expect, it } from "vitest";
import { getEndingProfile } from "@/lib/ending-profile";
import { getSimulatorConfig } from "@/lib/simulators";
import type { RunRecord } from "@/lib/types";

const baseRun: RunRecord = {
  id: "run-1",
  simulator: "queen",
  status: "completed",
  currentSceneId: "finale",
  runType: "first_campaign",
  identity: {
    name: "Isolde",
    dispositionId: "lawful",
    originId: "true-heir",
    variantId: "crown",
  },
  realm: {
    legitimacy: 82,
    treasury: 48,
    military: 52,
    publicSupport: 61,
  },
  decisions: [
    {
      sceneId: "crown-stolen",
      choiceId: "stand",
      intent: "defy",
      label: "Stand before the stolen throne",
      createdAt: "2026-06-23T00:00:00.000Z",
    },
  ],
  createdAt: "2026-06-23T00:00:00.000Z",
  updatedAt: "2026-06-23T00:00:00.000Z",
  completedAt: "2026-06-23T00:00:00.000Z",
};

describe("ending profile", () => {
  it("turns a completed crown run into a route-specific replay pitch", () => {
    const config = getSimulatorConfig("queen", "crown");

    const profile = getEndingProfile(config, baseRun);

    expect(profile.title).toBe("The Lawful Crown Restored");
    expect(profile.routeLabel).toBe("lawful restoration");
    expect(profile.replayCta).toMatch(/reclaim another crown/i);
    expect(profile.replayRoutes.map((route) => route.title)).toContain("Make Her Kneel Publicly");
    expect(profile.replayPrompt).not.toMatch(/\d+\s*(turns|rounds|choices)/i);
  });

  it("uses betrayal-specific motives for a betrayal run", () => {
    const config = getSimulatorConfig("queen", "betrayal");
    const betrayalRun: RunRecord = {
      ...baseRun,
      identity: {
        ...baseRun.identity,
        variantId: "betrayal",
      },
      realm: {
        legitimacy: 43,
        treasury: 51,
        military: 88,
        publicSupport: 47,
      },
    };

    const profile = getEndingProfile(config, betrayalRun);

    expect(profile.title).toBe("The Husband Who Signed First");
    expect(profile.routeLabel).toBe("counterstrike");
    expect(profile.replayRoutes.map((route) => route.title)).toContain("Expose the False Heir");
    expect(profile.verdict).toMatch(/same betrayal/i);
  });
});
