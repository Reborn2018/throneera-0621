import type { StoryScene } from "@/lib/types";

export function ChoiceList({ runId, scene }: { runId: string; scene: StoryScene }) {
  return (
    <div className="choices" aria-label="Choices">
      {scene.choices.map((choice, index) => (
        <form key={choice.id} method="post" action={`/api/runs/${runId}/choice`}>
          <input type="hidden" name="choiceId" value={choice.id} />
          <button className="choice" type="submit">
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
      ))}
    </div>
  );
}
