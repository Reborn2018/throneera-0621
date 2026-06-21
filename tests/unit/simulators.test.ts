import { describe, expect, it } from "vitest";
import { getSimulatorConfig, simulatorConfigs } from "@/lib/simulators";

describe("simulator configs", () => {
  it("defines Queen and Napoleon as directly addressable products", () => {
    expect(Object.keys(simulatorConfigs).sort()).toEqual(["napoleon", "queen"]);
    expect(getSimulatorConfig("queen").slug).toBe("queen");
    expect(getSimulatorConfig("napoleon").slug).toBe("napoleon");
  });

  it.each(["queen", "napoleon"] as const)(
    "gives %s enough authored structure for the MVP funnel",
    (slug) => {
      const config = getSimulatorConfig(slug);

      expect(config.landing.headline.length).toBeGreaterThan(10);
      expect(config.landing.cta).toMatch(/start|begin|claim|rise|rule/i);
      expect(config.identity.dispositions).toHaveLength(3);
      expect(config.identity.origins).toHaveLength(3);
      expect(config.prologueScenes.length).toBeGreaterThanOrEqual(5);
      expect(config.paidScenes.length).toBeGreaterThanOrEqual(6);
      expect(config.paidScenes.filter((scene) => scene.anchor)).toHaveLength(2);
      expect(config.endings.totalSlots).toBeGreaterThanOrEqual(5);
      expect(config.offer.sku).toBe("complete_current_campaign");
      expect(config.offer.amountMinor).toBe(799);
      expect(config.offer.currency).toBe("USD");
    },
  );

  it.each(["queen", "napoleon"] as const)(
    "keeps authored scene choices bounded for %s",
    (slug) => {
      const config = getSimulatorConfig(slug);
      const scenes = [...config.prologueScenes, ...config.paidScenes];

      for (const scene of scenes) {
        expect(scene.id).toMatch(/^[a-z0-9-]+$/);
        expect(scene.choices.length).toBeGreaterThanOrEqual(1);
        expect(scene.choices.length).toBeLessThanOrEqual(4);
        for (const choice of scene.choices) {
          expect(choice.id).toMatch(/^[a-z0-9-]+$/);
          expect(choice.intent).toMatch(/^[a-z0-9-]+$/);
        }
      }
    },
  );
});
