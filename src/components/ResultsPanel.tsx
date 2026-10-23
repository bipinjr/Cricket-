import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
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
        <div className="glass sheen grid gap-7 rounded-3xl p-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center border border-accent/20">
          <div className="flex min-w-0 items-center gap-6">
            <motion.div
              layoutId="subject-photo"
              className="relative shrink-0"
            >
              <img
                src={imageUrl}
                alt="The photo you uploaded"
                className="size-24 rounded-3xl object-cover sm:size-32 ring-2 ring-accent/30"
              />
              {matched && <div className="absolute inset-0 rounded-3xl shadow-lg shadow-cyan-500/40" />}
            </motion.div>
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
                  <h2 className="font-display truncate text-3xl font-bold sm:text-4xl">
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
                  <SearchX className="mb-2 size-8 text-muted-foreground" />
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
          {matched && <ConfidenceRing value={best.confidence} />}
        </div>
      </div>

      {alternates.length > 0 && (
        <section aria-label="Other possible matches" className="pt-2">
          <h3 className="mb-4 text-xs font-bold tracking-widest text-muted-foreground">
            {matched ? "💡 COULD ALSO BE…" : "🔍 CLOSEST MATCHES"}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {alternates.map((candidate, index) => (
              <motion.article
                key={candidate.player.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass sheen w-44 shrink-0 rounded-3xl p-5 text-center border border-accent/10 hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
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
                <p className="mt-4 truncate text-sm font-bold text-foreground">{candidate.player.name}</p>
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

      <div className="flex justify-center pt-4">
        <ActionButton variant="accent" size="lg" onClick={onReset}>
          🔄 Try Another Image
        </ActionButton>
      </div>
    </div>
  );
}
