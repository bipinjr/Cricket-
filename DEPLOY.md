# Deploying to Vercel

The project ships a `vercel.json` that builds the app for Vercel's own serverless
output format (`NITRO_PRESET=vercel`), so no extra setup is needed beyond importing
the repository.

## Steps

1. Push this repository to GitHub/GitLab and import it in Vercel ("Add New… → Project").
2. Leave the framework preset as **Other** — `vercel.json` already sets the build command.
3. Add these Environment Variables (Production + Preview), copied from your Supabase project:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your Supabase anon/publishable key |
   | `VITE_SUPABASE_PROJECT_ID` | your Supabase project ref |

4. Deploy. The face-recognition model files in `public/models` (~13 MB) are served as
   static assets, and all recognition runs in the visitor's browser — there is no
   server-side inference to configure.

## Notes

- Player data and face embeddings live in Supabase and are read with the public
  (anon) key through read-only row-level security policies, so no secret keys are
  needed at runtime.
- Publishing from Lovable keeps working exactly as before; the Vercel config is
  additive.
