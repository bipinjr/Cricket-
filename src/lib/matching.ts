import type { PlayerRecord } from "./playersDb";

export type MatchCandidate = {
  player: PlayerRecord;
  distance: number;
  confidence: number;
};

/** Euclidean distance between two 128-d face embeddings. */
export function euclidean(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = (a[i] as number) - (b[i] as number);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Calibrated distance -> confidence curve for the face-api 128-d embeddings,
 * anchored on the empirical same-person / different-person split measured on
 * our own reference set: <=0.30 is certain, 0.58 sits exactly on the 70%
 * accept threshold, and >=0.95 is unrelated.
 */
export function distanceToConfidence(distance: number): number {
  const points: [number, number][] = [
    [0.3, 100],
    [0.58, 70],
    [0.95, 0],
  ];
  if (distance <= points[0]![0]) return 100;
  if (distance >= points[2]![0]) return 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [d0, c0] = points[i]!;
    const [d1, c1] = points[i + 1]!;
    if (distance <= d1) {
      return Math.round(c0 + ((distance - d0) / (d1 - d0)) * (c1 - c0));
    }
  }
  return 0;
}

export const CONFIDENCE_THRESHOLD = 70;

/** Rank every player by their closest reference face. */
export function rankPlayers(
  descriptor: ArrayLike<number>,
  players: PlayerRecord[],
): MatchCandidate[] {
  return players
    .map((player) => {
      let best = Number.POSITIVE_INFINITY;
      for (const face of player.faces) {
        const d = euclidean(descriptor, face);
        if (d < best) best = d;
      }
      return { player, distance: best, confidence: distanceToConfidence(best) };
    })
    .filter((c) => Number.isFinite(c.distance))
    .sort((a, b) => a.distance - b.distance);
}

export function confidenceTone(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 85) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

export function confidenceLabel(confidence: number): string {
  const tone = confidenceTone(confidence);
  if (tone === "high") return "Strong match";
  if (tone === "medium") return "Likely match";
  return "Weak match";
}
