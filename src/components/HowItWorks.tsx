import { ScanFace, ShieldCheck, Sparkles, Upload } from "lucide-react";
import type { PlayerRecord } from "@/lib/playersDb";

const STEPS = [
  {
    icon: Upload,
    title: "Add a photo",
    body: "Drop, browse or paste any picture with a clear view of the player's face.",
  },
  {
    icon: ScanFace,
    title: "We find the face",
    body: "A neural network locates each face and turns it into a 128-point signature.",
  },
  {
    icon: Sparkles,
    title: "Get the match",
    body: "That signature is compared with our reference set to give a confidence score.",
  },
] as const;

export function HowItWorks({ players }: { players: PlayerRecord[] }) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="how-heading" className="space-y-5">
        <h3
          id="how-heading"
          className="text-center text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase"
        >
          How it works
        </h3>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-bold text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-4 font-display text-lg font-bold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
        <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
          Your photo never leaves your device — recognition runs in the browser.
        </p>
      </section>

      {players.length > 0 && (
        <section aria-labelledby="roster-heading" className="space-y-5">
          <div className="text-center">
            <h3
              id="roster-heading"
              className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase"
            >
              Players it can recognise
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {players.length} players today — photos of anyone else will show the closest
              look-alikes.
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground"
              >
                {player.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
