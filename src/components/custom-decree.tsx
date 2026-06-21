import type { StoryScene } from "@/lib/types";

export function CustomDecree({ runId, scene }: { runId: string; scene: StoryScene }) {
  if (!scene.allowCustomCommand) {
    return null;
  }

  const fallbackChoice = scene.choices[0];
  if (!fallbackChoice) {
    return null;
  }

  return (
    <details className="custom-decree">
      <summary>Issue Your Own Decree</summary>
      <form method="post" action={`/api/runs/${runId}/choice`}>
        <input type="hidden" name="choiceId" value={fallbackChoice.id} />
        <label>
          <span className="meta">Court wording</span>
          <textarea
            name="decree"
            maxLength={180}
            placeholder="How will you deliver the order before the court?"
          />
        </label>
        <p className="muted">
          The court will preserve your wording while interpreting the strategic intent.
        </p>
        <button className="button" type="submit">
          As I Command
        </button>
      </form>
    </details>
  );
}
