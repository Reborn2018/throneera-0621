import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentScene } from "@/lib/engine/scenes";
import { isSimulatorSlug } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ simulator: string; runId: string }>;
}) {
  const { simulator, runId } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const store = await getStore();
  const run = await store.getRun(runId);
  if (!run || run.simulator !== simulator) {
    notFound();
  }

  if (run.status === "identity") {
    redirect(`/${simulator}/start`);
  }

  if (run.status === "paywalled" || run.status === "checkout_pending") {
    redirect(`/${simulator}/unlock/${run.id}`);
  }

  if (run.status === "completed") {
    redirect(`/${simulator}/ending/${run.id}`);
  }

  const scene = getCurrentScene(run);
  if (!scene) {
    notFound();
  }

  return (
    <main className="page">
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <p className="meta">{scene.act}</p>
        <h1>{scene.title}</h1>
        {scene.narration.map((paragraph) => (
          <p className="copy" key={paragraph}>
            {paragraph}
          </p>
        ))}
        {scene.dialogue ? (
          <blockquote className="copy">
            <strong>{scene.dialogue.speaker}:</strong> {scene.dialogue.text}
          </blockquote>
        ) : null}
        {scene.letter ? (
          <aside className="panel">
            <p className="meta">{scene.letter.from}</p>
            <p>{scene.letter.text}</p>
          </aside>
        ) : null}
        <div className="choices">
          {scene.choices.map((choice) => (
            <form key={choice.id} method="post" action={`/api/runs/${run.id}/choice`}>
              <input type="hidden" name="choiceId" value={choice.id} />
              <button className="choice" type="submit">
                {choice.label}
              </button>
            </form>
          ))}
        </div>
        <Link className="muted" href={`/${simulator}`}>
          Leave for now
        </Link>
      </section>
    </main>
  );
}
