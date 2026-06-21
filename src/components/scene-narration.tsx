import type { StoryScene } from "@/lib/types";

export function SceneNarration({ scene }: { scene: StoryScene }) {
  return (
    <>
      <p className="scene-place">{scene.act}</p>
      <h1 className="scene-title">{scene.title}</h1>
      <div className="scene-rule" aria-hidden="true" />
      {scene.narration.map((paragraph, index) => (
        <p className={index === 0 ? "scene-text lead" : "scene-text"} key={paragraph}>
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
          <p className="eyebrow">{scene.letter.from}</p>
          <p>{scene.letter.text}</p>
        </aside>
      ) : null}
    </>
  );
}
