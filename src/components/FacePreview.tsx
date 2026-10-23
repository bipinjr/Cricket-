import { motion } from "framer-motion";
import type { DetectedFace } from "@/lib/faceEngine";
import { cn } from "@/lib/utils";

/**
 * Shows the uploaded photo with detected-face markers.
 * Boxes are positioned in percentages of the natural image size so they scale.
 */
export function FacePreview({
  imageUrl,
  naturalSize,
  faces,
  selectedIndex,
  onSelect,
  scanning = false,
}: {
  imageUrl: string;
  naturalSize: { width: number; height: number } | null;
  faces: DetectedFace[];
  selectedIndex: number;
  onSelect?: (index: number) => void;
  scanning?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border">
      <motion.img
        layoutId="subject-photo"
        src={imageUrl}
        alt="The photo you uploaded"
        className="block max-h-[60vh] w-full object-contain"
      />
      {scanning && <span className="scan-line" aria-hidden="true" />}
      {naturalSize &&
        faces.map((face, index) => {
          const active = index === selectedIndex;
          const style = {
            left: `${(face.box.x / naturalSize.width) * 100}%`,
            top: `${(face.box.y / naturalSize.height) * 100}%`,
            width: `${(face.box.width / naturalSize.width) * 100}%`,
            height: `${(face.box.height / naturalSize.height) * 100}%`,
          };
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect?.(index)}
              style={style}
              aria-label={`Use face ${index + 1}`}
              aria-pressed={active}
              className={cn(
                "absolute rounded-xl border-2 transition-all",
                active
                  ? "border-[var(--saffron)] shadow-[0_0_24px_-2px_var(--saffron)]"
                  : "border-border hover:border-foreground",
              )}
            >
              {faces.length > 1 && (
                <span
                  className={cn(
                    "absolute -top-3 -left-3 flex size-7 items-center justify-center rounded-full text-xs font-bold",
                    active
                      ? "animate-pulse bg-[var(--saffron)] text-accent-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
}
