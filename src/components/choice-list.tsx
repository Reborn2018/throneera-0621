import type { StoryScene } from "@/lib/types";

export function ChoiceList({ runId, scene }: { runId: string; scene: StoryScene }) {
  return (
    <div className="choices" aria-label="Choices">
      {scene.choices.map((choice) => (
        <form key={choice.id} method="post" action={`/api/runs/${runId}/choice`}>
          <input type="hidden" name="choiceId" value={choice.id} />
          <button className="choice" type="submit">
            <span>{choice.label}</span>
            {choice.hint ? <small>{choice.hint}</small> : null}
          </button>
        </form>
      ))}
    </div>
  );
}
