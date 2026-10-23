import { motion } from "framer-motion";
import { confidenceLabel, confidenceTone } from "@/lib/matching";
import { cn } from "@/lib/utils";

const toneClass = {
  high: "text-accent",
  medium: "text-warning",
  low: "text-muted-foreground",
} as const;

export function ConfidenceRing({
  value,
  size = 132,
  showLabel = true,
  className,
}: {
  value: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const stroke = size >= 100 ? 9 : 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = confidenceTone(value);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="text-border"
            stroke="currentColor"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="currentColor"
            className={toneClass[tone]}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn("font-display font-bold", size >= 100 ? "text-3xl" : "text-base")}
          >
            {value}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-semibold uppercase tracking-widest", toneClass[tone])}>
          {confidenceLabel(value)}
        </span>
      )}
    </div>
  );
}
