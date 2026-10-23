import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  ScanSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ActionButton";
import { Dropzone, validateImageFile } from "@/components/Dropzone";
import { FacePreview } from "@/components/FacePreview";
import { HowItWorks } from "@/components/HowItWorks";
import { Logo } from "@/components/Logo";
import { ProcessingPanel } from "@/components/ProcessingPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { StepIndicator } from "@/components/StepIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  detectFaces,
  loadFaceEngine,
  loadImageFromUrl,
  readImage,
  type DetectedFace,
} from "@/lib/faceEngine";
import { rankPlayers, type MatchCandidate } from "@/lib/matching";
import { playersQueryOptions } from "@/lib/playersDb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Who's That Cricketer? Indian Cricket Player Face Recognition" },
      {
        name: "description",
        content:
          "Upload a photo and identify Indian cricket players in seconds, with a confidence score. Runs entirely in your browser.",
      },
      {
        property: "og:title",
        content: "Who's That Cricketer? Face Recognition for Indian Cricket",
      },
      {
        property: "og:description",
        content:
          "Upload a photo and identify Indian cricket players in seconds, with a confidence score.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Screen = "upload" | "preview" | "processing" | "results";

const STEP_FOR_SCREEN: Record<Screen, number> = {
  upload: 0,
  preview: 1,
  processing: 2,
  results: 3,
};

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

function Home() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [selectedFace, setSelectedFace] = useState(0);
  const [step, setStep] = useState(0);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [scanning, setScanning] = useState(false);
  const [engine, setEngine] = useState<"loading" | "ready" | "error">("loading");
  const objectUrlRef = useRef<string | null>(null);

  const {
    data: players,
    isLoading: playersLoading,
    error: playersError,
  } = useQuery(playersQueryOptions);

  useEffect(() => {
    loadFaceEngine()
      .then(() => setEngine("ready"))
      .catch(() => {
        setEngine("error");
        toast.error("The recognition model could not be loaded. Please refresh the page.");
      });
  }, []);

  useEffect(() => {
    if (playersError) toast.error("We couldn't load the player database. Check your connection.");
  }, [playersError]);

  const analyseImage = useCallback(async (image: HTMLImageElement, url: string) => {
    setImageUrl(url);
    setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
    setScreen("preview");
    setScanning(true);
    try {
      const detected = await detectFaces(image);
      setFaces(detected);
      setSelectedFace(0);
      if (detected.length === 0) {
        toast.error("No face found in that photo. Try a clearer, front-facing picture.");
      }
    } catch {
      toast.error("That image couldn't be analysed. Please try a different one.");
    } finally {
      setTimeout(() => setScanning(false), 1200);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const { url, image } = await readImage(file);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        await analyseImage(image, url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "That image could not be opened.");
      }
    },
    [analyseImage],
  );

  // Let people paste a screenshot or copied image straight onto the upload screen.
  useEffect(() => {
    if (screen !== "upload") return;
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) return;
      event.preventDefault();
      const error = validateImageFile(file);
      if (error) toast.error(error);
      else void handleFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [screen, handleFile]);

  const handleSample = useCallback(
    async (url: string) => {
      try {
        const image = await loadImageFromUrl(url);
        await analyseImage(image, url);
      } catch {
        toast.error("That sample photo could not be loaded.");
      }
    },
    [analyseImage],
  );

  const runMatch = useCallback(async () => {
    const face = faces[selectedFace];
    if (!face) {
      toast.error("Pick a face to analyse first.");
      return;
    }
    if (!players || players.length === 0) {
      toast.error("The player database isn't ready yet. Please try again in a moment.");
      return;
    }
    setScreen("processing");
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 2600),
    ];
    const started = Date.now();
    const ranked = rankPlayers(face.descriptor, players);
    const wait = Math.max(0, 1500 - (Date.now() - started));
    setTimeout(() => {
      timers.forEach(clearTimeout);
      setCandidates(ranked);
      setScreen("results");
    }, wait);
  }, [faces, players, selectedFace]);

  const reset = useCallback(() => {
    setScreen("upload");
    setFaces([]);
    setCandidates([]);
    setNaturalSize(null);
    setImageUrl(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const samples = (players ?? []).filter((p) => p.photoUrl).slice(0, 5);

  return (
    <>
      <div className="stadium-bg" aria-hidden="true" />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-6 pb-8 pt-2">
          <div className="flex min-w-0 items-center gap-4">
            <Logo className="shrink-0 size-10" />
            <div className="min-w-0">
              <h1 className="font-display truncate text-lg font-bold sm:text-xl gradient-text">
                Cricket Face Finder
              </h1>
              <p className="truncate text-xs tracking-wider text-muted-foreground">
                AI-POWERED RECOGNITION SYSTEM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              role="status"
              className={cn(
                "hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium sm:inline-flex",
                engine === "error" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full",
                  engine === "ready" && "bg-success",
                  engine === "loading" && "animate-pulse bg-warning",
                  engine === "error" && "bg-destructive",
                )}
              />
              {engine === "ready"
                ? "AI ready"
                : engine === "loading"
                  ? "Loading AI model…"
                  : "AI unavailable"}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {screen !== "upload" && (
          <div className="pt-2 pb-4">
            <StepIndicator current={STEP_FOR_SCREEN[screen]} />
          </div>
        )}

        <main className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {screen === "upload" && (
              <motion.section key="upload" {...fade} className="space-y-10">
                <div className="space-y-5 text-center">
                  <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                    <ScanSearch className="size-3.5" aria-hidden="true" />
                    Face recognition for Indian cricket
                  </p>
                  <h2 className="font-display text-5xl font-bold tracking-tight text-balance sm:text-7xl">
                    <span className="block">Who's That</span>
                    <span className="gradient-text mt-1 block pb-1">Cricketer?</span>
                  </h2>
                  <p className="mx-auto max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                    Drop in a photo and get the player's name with a confidence score in seconds.
                  </p>
                  <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <li className="inline-flex items-center gap-2">
                      <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                      Private, on-device
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <Cpu className="size-4 text-accent" aria-hidden="true" />
                      No sign-up
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <Users className="size-4 text-accent" aria-hidden="true" />
                      {players ? `${players.length} players` : "Loading players…"}
                    </li>
                  </ul>
                </div>
                <Dropzone onFile={handleFile} onError={(m) => toast.error(m)} />
                <div className="space-y-4">
                  <p className="text-center text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    Or try a sample
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {playersLoading &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="shimmer size-20 rounded-3xl" />
                      ))}
                    {samples.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleSample(player.photoUrl!)}
                        className="group flex w-20 flex-col items-center gap-2 rounded-3xl"
                        aria-label={`Try the sample photo of ${player.name}`}
                      >
                        <span className="block size-20 overflow-hidden rounded-3xl border-2 border-transparent transition-[border-color,box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-[0_12px_30px_-10px_var(--accent)]">
                          <img
                            src={player.photoUrl!}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </span>
                        <span className="w-full truncate text-center text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                          {player.shortName ?? player.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <HowItWorks players={players ?? []} />
                </div>
              </motion.section>
            )}

            {screen === "preview" && imageUrl && (
              <motion.section key="preview" {...fade} className="space-y-6">
                <FacePreview
                  imageUrl={imageUrl}
                  naturalSize={naturalSize}
                  faces={faces}
                  selectedIndex={selectedFace}
                  onSelect={setSelectedFace}
                  scanning={scanning}
                />
                <p
                  className={cn(
                    "flex items-center justify-center gap-2 text-center text-sm font-medium",
                    scanning
                      ? "text-muted-foreground"
                      : faces.length === 0
                        ? "text-warning"
                        : "text-success",
                  )}
                  aria-live="polite"
                >
                  {scanning ? (
                    <>
                      <ScanSearch className="size-4 animate-pulse" aria-hidden="true" />
                      Looking for faces…
                    </>
                  ) : faces.length === 0 ? (
                    <>
                      <AlertTriangle className="size-4" aria-hidden="true" />
                      No face detected — try another photo.
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      {faces.length === 1
                        ? "Face detected and ready to analyse."
                        : `${faces.length} faces detected — tap the one you want identified.`}
                    </>
                  )}
                </p>
                <div className="flex flex-col-reverse items-center justify-center gap-4 sm:flex-row">
                  <ActionButton variant="ghost" onClick={reset}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Choose Different Image
                  </ActionButton>
                  <ActionButton
                    variant="accent"
                    size="lg"
                    onClick={runMatch}
                    disabled={scanning || faces.length === 0}
                  >
                    <ScanSearch className="size-5" aria-hidden="true" />
                    Identify Player
                  </ActionButton>
                </div>
              </motion.section>
            )}

            {screen === "processing" && (
              <motion.section key="processing" {...fade} className="space-y-5">
                {imageUrl && (
                  <FacePreview
                    imageUrl={imageUrl}
                    naturalSize={naturalSize}
                    faces={faces.slice(selectedFace, selectedFace + 1)}
                    selectedIndex={0}
                    scanning
                  />
                )}
                <ProcessingPanel step={step} />
              </motion.section>
            )}

            {screen === "results" && imageUrl && (
              <motion.section key="results" {...fade} aria-live="polite">
                <ResultsPanel imageUrl={imageUrl} candidates={candidates} onReset={reset} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-10 border-t border-border/60 pt-6 pb-2 text-center text-xs text-muted-foreground">
          Recognition runs on your device · Reference photos from{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-4 hover:text-foreground"
          >
            Wikimedia Commons
          </a>
        </footer>
      </div>
    </>
  );
}
