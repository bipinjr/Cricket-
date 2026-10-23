import { supabase } from "@/integrations/supabase/client";

export type PlayerRecord = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  role: string | null;
  era: string | null;
  years: string | null;
  photoUrl: string | null;
  photoCredit: string | null;
  faces: number[][];
};

/** Load every player together with their reference face embeddings. */
export async function fetchPlayers(): Promise<PlayerRecord[]> {
  const [{ data: players, error: playersError }, { data: faces, error: facesError }] =
    await Promise.all([
      supabase.from("players").select("*").order("name"),
      supabase.from("player_faces").select("player_id, descriptor"),
    ]);

  if (playersError) throw playersError;
  if (facesError) throw facesError;

  const byPlayer = new Map<string, number[][]>();
  for (const face of faces ?? []) {
    const list = byPlayer.get(face.player_id) ?? [];
    list.push(face.descriptor as number[]);
    byPlayer.set(face.player_id, list);
  }

  return (players ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortName: p.short_name,
    role: p.role,
    era: p.era,
    years: p.years,
    photoUrl: p.photo_url,
    photoCredit: p.photo_credit,
    faces: byPlayer.get(p.id) ?? [],
  }));
}

export const playersQueryOptions = {
  queryKey: ["players"] as const,
  queryFn: fetchPlayers,
  staleTime: 5 * 60 * 1000,
};
