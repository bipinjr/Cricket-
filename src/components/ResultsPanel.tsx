import { motion } from "framer-motion";
import { ArrowLeftRight, Lightbulb, RotateCcw, Search, SearchX } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { CONFIDENCE_THRESHOLD, type MatchCandidate } from "@/lib/matching";

function Burst() {
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          className="absolute top-1/3 left-1/2 size-1.5 rounded-full [background-image:var(--gradient-accent)]"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / pieces.length) * Math.PI * 2) * 180,
            y: Math.sin((i / pieces.length) * Math.PI * 2) * 140,
            scale: 0.4,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function ResultsPanel({
  imageUrl,
  candidates,
  onReset,
}: {
  imageUrl: string;
  candidates: MatchCandidate[];
  onReset: () => void;
}) {
  const best = candidates[0];
  const matched = !!best && best.confidence >= CONFIDENCE_THRESHOLD;
  // Only offer alternatives when the top match is not a confident one — a
  // certain result shouldn't be muddied by near-miss suggestions.
  const alternates =
    matched && best.confidence > 90 ? [] : candidates.slice(matched ? 1 : 0, matched ? 4 : 3);

  return (
    <div className="space-y-7">
      <div className="relative">
        {matched && best.confidence > 90 && <Burst />}
        <div className="glass grid gap-7 rounded-3xl border border-accent/20 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-3">
              <motion.figure layoutId="subject-photo" className="relative">
                <img
                  src={imageUrl}
                  alt="The photo you uploaded"
                  className="size-24 rounded-3xl object-cover ring-2 ring-accent/30 sm:size-28"
                />
                <figcaption className="mt-1.5 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Your photo
                </figcaption>
              </motion.figure>
              {matched && best.player.photoUrl && (
                <>
                  <ArrowLeftRight className="mb-5 size-5 text-accent" aria-hidden="true" />
                  <motion.figure
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.35, ease: "easeOut" }}
                  >
                    <img
                      src={best.player.photoUrl}
                      alt={`Reference photo of ${best.player.name}`}
                      className="size-24 rounded-3xl object-cover ring-2 ring-accent/30 sm:size-28"
                    />
                    <figcaption className="mt-1.5 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Reference
                    </figcaption>
                  </motion.figure>
                </>
              )}
            </div>
            <div className="min-w-0">
              {matched ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 16 }}
                >
                  <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Identified as
                  </p>
                  <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
                    {best.player.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {best.player.role && (
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {best.player.role}
                      </span>
                    )}
                    {best.player.era && (
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {best.player.era}
                      </span>
                    )}
                    {best.player.years && (
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {best.player.years}
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div>
                  <SearchX className="mb-2 size-8 text-muted-foreground" aria-hidden="true" />
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">
                    We couldn't find a confident match
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The closest players are below, but the similarity is under our{" "}
                    {CONFIDENCE_THRESHOLD}% threshold. A clear, front-facing photo usually helps.
                  </p>
                </div>
              )}
            </div>
          </div>
          {matched && <ConfidenceRing value={best.confidence} className="justify-self-center" />}
        </div>
      </div>

      {alternates.length > 0 && (
        <section aria-label="Other possible matches" className="pt-2">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {matched ? (
              <Lightbulb className="size-4 text-warning" aria-hidden="true" />
            ) : (
              <Search className="size-4 text-accent" aria-hidden="true" />
            )}
            {matched ? "Could also be…" : "Closest matches"}
          </h3>
          <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-3 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {alternates.map((candidate, index) => (
              <motion.article
                key={candidate.player.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass w-44 shrink-0 snap-start rounded-3xl border border-accent/10 p-5 text-center sm:w-auto"
              >
                {candidate.player.photoUrl ? (
                  <img
                    src={candidate.player.photoUrl}
                    alt={candidate.player.name}
                    loading="lazy"
                    className="mx-auto size-24 rounded-full object-cover ring-2 ring-accent/20"
                  />
                ) : (
                  <div className="shimmer mx-auto size-24 rounded-full" />
                )}
                <p className="mt-4 truncate text-sm font-bold text-foreground">
                  {candidate.player.name}
                </p>
                {candidate.player.role && (
                  <p className="truncate text-xs text-muted-foreground">{candidate.player.role}</p>
                )}
                <ConfidenceRing
                  value={candidate.confidence}
                  size={72}
                  showLabel={false}
                  className="mt-3"
                />
              </motion.article>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col items-center gap-3 pt-4">
        <ActionButton variant="accent" size="lg" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try Another Image
        </ActionButton>
        <p className="text-center text-xs text-muted-foreground">
          Not who you expected? A sharper, front-facing photo usually gives a better match.
        </p>
      </div>
    </div>
  );
}
