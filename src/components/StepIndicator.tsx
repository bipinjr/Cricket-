import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Detect", "Identify"] as const;

/** Three-step wayfinding bar; `current` equal to STEPS.length marks every step done. */
export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mx-auto flex w-full max-w-md items-center" aria-label="Progress">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-300",
                  done &&
                    "border-transparent [background-image:var(--gradient-accent)] text-accent-foreground",
                  active && "border-accent text-accent",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold tracking-wide",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-3 h-px flex-1 transition-colors duration-500",
                  done ? "bg-accent" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
