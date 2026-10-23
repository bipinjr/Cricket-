import { motion } from "framer-motion";
import { ImagePlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Please choose a JPG, PNG or WebP image.";
  if (file.size > MAX_BYTES) return "That image is over 10 MB. Please pick a smaller one.";
  if (file.size < 1024) return "That file looks empty or damaged.";
  return null;
}

export function Dropzone({
  onFile,
  onError,
}: {
  onFile: (file: File) => void;
  onError: (message: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      onError(error);
      return;
    }
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative rounded-3xl p-1 transition-colors duration-300",
        dragging && "[background-image:var(--gradient-accent)]",
      )}
    >
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "glass flex w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl px-6 py-16 text-center transition-all duration-300",
          dragging ? "border-transparent bg-secondary shadow-lg shadow-cyan-500/30" : "border-2 border-dashed border-accent/40 hover:border-accent/60 hover:shadow-lg hover:shadow-cyan-500/20",
          !dragging && "breathe",
        )}
        aria-label="Upload a cricketer's photo"
      >
        <motion.span
          animate={dragging ? { y: [-6, 4, -6] } : { y: 0 }}
          transition={{ repeat: dragging ? Infinity : 0, duration: 0.8 }}
          className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/40 text-accent transition-all"
        >
          {dragging ? <Upload className="size-8" strokeWidth={1.5} /> : <ImagePlus className="size-8" strokeWidth={1.5} />}
        </motion.span>
        <span className="space-y-1">
          <p className="font-display text-2xl font-bold">
            {dragging ? "Drop the photo here" : "Upload a Cricket Photo"}
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG or WebP · up to 10 MB
          </p>
          <p className="text-xs text-muted-foreground opacity-75">
            One clear face works best for accurate identification
          </p>
        </span>
        <span className="text-sm text-accent font-medium underline decoration-dotted underline-offset-4 hover:no-underline">
          or click to browse
        </span>
      </motion.button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={undefined}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
