import { describe, expect, it } from "vitest";
import React from "react";
import ThroneEraGame from "@/components/ThroneEraGame";
import QueenPlay from "@/app/queen/play/page";
import NapoleonPlay from "@/app/napoleon/play/page";

describe("engine-v3 play pages", () => {
  it("renders the Queen engine-v3 game without a simulator selector", () => {
    const element = QueenPlay();

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(ThroneEraGame);
    expect(element.props).toMatchObject({ era: "queen" });
  });

  it("renders the Napoleon engine-v3 game without a simulator selector", () => {
    const element = NapoleonPlay();

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(ThroneEraGame);
    expect(element.props).toMatchObject({ era: "napoleon" });
  });
});
