import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const PROCESSING_STEPS = [
  "Detecting face…",
  "Extracting features…",
  "Matching against players…",
  "Almost there…",
] as const;

export function ProcessingPanel({ step }: { step: number }) {
  return (
    <div className="glass rounded-3xl p-8" role="status" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full w-1/3 rounded-full [background-image:var(--gradient-accent)]"
          animate={{ x: ["-110%", "330%"] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>
      <ul className="mt-6 space-y-3">
        {PROCESSING_STEPS.slice(0, 3).map((label, index) => {
          const done = step > index;
          const active = step === index || (step >= 3 && index === 2);
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border",
                  done
                    ? "border-success text-success"
                    : active
                      ? "border-[var(--saffron)] text-accent"
                      : "border-border",
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <motion.span
                    className="size-2 rounded-full bg-[var(--saffron)]"
                    animate={{ scale: [0.6, 1.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                ) : null}
              </span>
              {step >= 3 && index === 2 ? PROCESSING_STEPS[3] : label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
