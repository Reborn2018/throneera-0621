import type { StoryScene } from "@/lib/types";

export function SceneNarration({ scene }: { scene: StoryScene }) {
  return (
    <>
      <p className="meta">{scene.act}</p>
      <h1>{scene.title}</h1>
      {scene.narration.map((paragraph) => (
        <p className="copy" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {scene.dialogue ? (
        <blockquote className="dialogue">
          <strong>{scene.dialogue.speaker}</strong>
          <span>{scene.dialogue.text}</span>
        </blockquote>
      ) : null}
      {scene.letter ? (
        <aside className="letter">
          <p className="meta">{scene.letter.from}</p>
          <p>{scene.letter.text}</p>
        </aside>
      ) : null}
    </>
  );
}
