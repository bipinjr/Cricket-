CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  role TEXT,
  era TEXT,
  years TEXT,
  photo_url TEXT,
  photo_credit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.player_faces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  descriptor DOUBLE PRECISION[] NOT NULL,
  source_url TEXT,
  license TEXT,
  detection_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX player_faces_player_id_idx ON public.player_faces(player_id);

GRANT SELECT ON public.players TO anon, authenticated;
GRANT SELECT ON public.player_faces TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
GRANT ALL ON public.player_faces TO service_role;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_faces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are publicly readable" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Player faces are publicly readable" ON public.player_faces FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();