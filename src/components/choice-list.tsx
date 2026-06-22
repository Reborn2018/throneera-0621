"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import type { SceneChoice, SimulatorConfig, StoryScene } from "@/lib/types";

const IMPACT_DELAY_MS = 1050;

interface ChoiceImpact {
  id: string;
  intent: string;
  label: string;
  hint?: string;
  deltas: Array<{
    label: string;
    value: number;
  }>;
}

export function ChoiceList({
  runId,
  scene,
  config,
}: {
  runId: string;
  scene: StoryScene;
  config: SimulatorConfig;
}) {
  const [impact, setImpact] = useState<ChoiceImpact | null>(null);
  const submittingRef = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>, choice: SceneChoice) {
    if (submittingRef.current) {
      return;
    }

    event.preventDefault();
    submittingRef.current = true;

    const form = event.currentTarget;
    setImpact(buildChoiceImpact(choice, config));

    window.setTimeout(() => {
      form.submit();
    }, IMPACT_DELAY_MS);
  }

  const hasImpact = Boolean(impact);
  const headline = config.slug === "queen" ? "The court changes" : "History rewritten";
  const seal = config.slug === "queen" ? "Royal seal struck" : "Order carried";
  const transit =
    config.slug === "queen"
      ? "Your command is moving through the hall."
      : "Your command is moving across the map.";

  return (
    <div className={`choices${hasImpact ? " choices-locked" : ""}`} aria-label="Choices">
      {scene.choices.map((choice, index) => {
        const isSelected = impact?.id === choice.id;
        const choiceClass = `choice${hasImpact && isSelected ? " sealed" : ""}${
          hasImpact && !isSelected ? " dim" : ""
        }`;

        return (
          <form
            key={choice.id}
            method="post"
            action={`/api/runs/${runId}/choice`}
            onSubmit={(event) => handleSubmit(event, choice)}
          >
            <input type="hidden" name="choiceId" value={choice.id} />
            <button className={choiceClass} type="submit" disabled={hasImpact}>
              <span className="choice-tone">{choice.intent}</span>
              <span className="choice-num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="choice-body">
                <span className="choice-label">{choice.label}</span>
                {choice.hint ? <small>{choice.hint}</small> : null}
              </span>
            </button>
          </form>
        );
      })}
      {impact ? (
        <div className="choice-impact" role="status" aria-live="polite">
          <div className="choice-impact-card">
            <span className="choice-impact-kicker">{seal}</span>
            <strong className="choice-impact-headline">{headline}</strong>
            <span className="choice-impact-stamp">{impact.intent}</span>
            <p className="choice-impact-echo">{impact.label}</p>
            {impact.hint ? <p className="choice-impact-hint">{impact.hint}</p> : null}
            {impact.deltas.length ? (
              <div className="choice-impact-deltas" aria-label="Stat changes">
                {impact.deltas.map((delta) => (
                  <span
                    className={`choice-delta${delta.value < 0 ? " down" : " up"}`}
                    key={delta.label}
                  >
                    {delta.label} {delta.value > 0 ? "+" : ""}
                    {delta.value}
                  </span>
                ))}
              </div>
            ) : null}
            <small>{transit}</small>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildChoiceImpact(choice: SceneChoice, config: SimulatorConfig): ChoiceImpact {
  const deltas = Object.entries(choice.delta ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] !== 0)
    .map(([key, value]) => ({
      label: config.realmLabels[key as keyof typeof config.realmLabels] ?? key,
      value,
    }));

  return {
    id: choice.id,
    intent: choice.intent,
    label: choice.label,
    hint: choice.hint,
    deltas,
  };
}
