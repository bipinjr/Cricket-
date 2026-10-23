# Cricket Face Finder

**Who's that cricketer?** Upload a photo, and this web app tells you which Indian cricket player is in it, with a confidence score, in a few seconds.

The face recognition runs entirely inside your browser. Your photo is never uploaded to a server; the only thing the app downloads is a small table of player "face signatures" to compare against.

---

## What it does

1. **You add a photo**: drag it onto the page, pick it from your files, paste it with <kbd>Ctrl</kbd>+<kbd>V</kbd>, or click one of the sample photos.
2. **The app finds every face** in the picture and draws a box around each one. If there are several people, you tap the face you want identified.
3. **It compares that face** with the 20 players it knows and shows:
   - the best match, with your photo side by side with the player's reference photo,
   - a confidence ring (for example _88% · Strong match_),
   - the next closest players ("Could also be…") when the match isn't certain.
4. If nothing is close enough, it says so honestly ("We couldn't find a confident match") and shows the nearest look-alikes instead of guessing.

### Players it can recognise

Anil Kumble, Hardik Pandya, Jasprit Bumrah, Kapil Dev, KL Rahul, Mohammed Shami, MS Dhoni, Rahul Dravid, Ravichandran Ashwin, Ravindra Jadeja, Rishabh Pant, Rohit Sharma, Sachin Tendulkar, Shikhar Dhawan, Shubman Gill, Smriti Mandhana, Sourav Ganguly, Suresh Raina, Virat Kohli, Yuvraj Singh.

A photo of anyone else will still get an answer: the closest look-alikes, with low confidence.

---

## How the recognition works

The app doesn't use a model that was "trained on cricketers". It uses a general-purpose face model and a lookup table. That is simpler, works offline, and adding a player only means adding photos, with no retraining.

```
your photo ──► find faces ──► turn each face into 128 numbers ──► compare with every player ──► best match + confidence
              (SSD MobileNet)   (FaceNet-style ResNet embedding)    (Euclidean distance)
```

**1. Finding faces.** [face-api.js](https://github.com/vladmandic/face-api) (running on TensorFlow.js in the browser, using WebGL when available) runs an SSD MobileNet detector, then a 68-point landmark model to line each face up.

**2. Turning a face into numbers.** A face-recognition network converts each aligned face into a list of 128 numbers, its _embedding_. Photos of the same person give embeddings that sit close together; different people end up far apart.

**3. Comparing.** Every player in the database has one or more reference embeddings, made ahead of time from free-licence photos on Wikimedia Commons. The app measures the distance between your face's embedding and each reference, and keeps the closest one per player.

**4. Turning distance into a percentage.** A raw distance like `0.47` means little to people, so it is mapped onto a 0–100% scale calibrated on our own reference photos (see [`src/lib/matching.ts`](src/lib/matching.ts)):

| Distance     | Confidence | What it means                                       |
| ------------ | ---------- | --------------------------------------------------- |
| 0.30 or less | 100%       | Almost certainly the same person                    |
| 0.58         | 70%        | The cut-off: below this the app won't claim a match |
| 0.95 or more | 0%         | Clearly a different person                          |

Values in between are interpolated in a straight line. Labels: **85%+** _Strong match_, **60–84%** _Likely match_, **below 60%** _Weak match_.

The three model files (about 13 MB) live in [`public/models`](public/models) and are cached by the browser after the first visit.

---

## Tech stack

| Part          | What we use                                                              | Why                                                                       |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| App framework | [TanStack Start](https://tanstack.com/start) + React 19 + Vite           | File-based routing, server rendering for a fast first paint               |
| Styling       | Tailwind CSS v4 with design tokens in [`src/styles.css`](src/styles.css) | Dark "stadium at dusk" theme plus a light theme, all colours in one place |
| Animation     | Framer Motion                                                            | Screen transitions, the confidence ring fill, the result reveal           |
| Face AI       | `@vladmandic/face-api` (TensorFlow.js)                                   | Runs entirely in the browser                                              |
| Data          | Supabase (Postgres)                                                      | Stores players and their face embeddings; read-only for the public        |
| Hosting       | Vercel (via [`vercel.json`](vercel.json)) or Lovable                     |                                                                           |

---

## Project layout

```
src/
  routes/index.tsx          The whole app flow: upload → preview → processing → results
  components/
    Dropzone.tsx            Drag/drop/browse upload box + file validation (JPG/PNG/WebP, ≤10 MB)
    FacePreview.tsx         Your photo with clickable face boxes and the scanning line
    ProcessingPanel.tsx     The "Detecting face… / Matching…" progress list
    ResultsPanel.tsx        Best match, side-by-side photos, alternates
    ConfidenceRing.tsx      The animated % ring (colour + text, screen-reader friendly)
    StepIndicator.tsx       Upload → Detect → Identify progress bar
    HowItWorks.tsx          Explainer cards and the list of known players
  lib/
    faceEngine.ts           Loads the models, detects faces, computes embeddings
    matching.ts             Distance → confidence maths and player ranking
    playersDb.ts            Fetches players + embeddings from Supabase
  integrations/supabase/    Generated Supabase client and types
public/models/              face-api model weights
supabase/migrations/        Database tables + the 20-player seed data
```

---

## The database

Two tables, both **readable by anyone and writable by no one** (row-level security allows `SELECT` only), so the public browser key can't change anything.

- **`players`**: one row per cricketer: `name`, `short_name`, `role`, `era`, `years`, `photo_url`, `photo_credit`.
- **`player_faces`**: one row per reference photo: `player_id`, `descriptor` (the 128-number embedding), `source_url`, `license`, `detection_score`.

Both are created and filled by the two SQL files in [`supabase/migrations`](supabase/migrations).

---

## Running it on your computer

You need **Node.js 20+** and npm.

```sh
git clone https://github.com/bipinjr/Cricket-.git
cd Cricket-
npm install
```

Create a file called `.env` in the project folder with your Supabase project's details (Supabase dashboard → Project Settings → API):

```sh
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_PROJECT_ID="<your-project-ref>"
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

`.env` is git-ignored, so it never gets committed. Then:

```sh
npm run dev      # starts the app at http://localhost:8080
npm run build    # production build
npm run lint     # code style checks
```

### Setting up a fresh Supabase database

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough).
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/20260913153705_…sql` creates the tables and read-only policies.
   2. `supabase/migrations/20260914090000_seed_players_and_faces.sql` loads the 20 players and their embeddings.
3. Copy the project URL and **publishable** key into `.env` as shown above.

The publishable key is meant to be public (it ships to every visitor's browser). Never put the `service_role` / secret key in this app.

---

## Deploying to Vercel

The repo already includes [`vercel.json`](vercel.json), which builds with Vercel's serverless output (`NITRO_PRESET=vercel`).

1. In Vercel: **Add New → Project →** import this GitHub repo. Leave the framework preset as **Other**.
2. Under **Settings → Environment Variables**, add these for **Production** and **Preview**:

   | Name                            | Value                         |
   | ------------------------------- | ----------------------------- |
   | `VITE_SUPABASE_URL`             | your Supabase project URL     |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your Supabase publishable key |
   | `VITE_SUPABASE_PROJECT_ID`      | your Supabase project ref     |

3. Deploy. Every push to `main` redeploys automatically.

`VITE_*` values are baked into the JavaScript **at build time**. If you change them in Vercel, trigger a new deployment (Deployments → ⋯ → Redeploy) or the old values stay in place.

**If the build fails with `403 Forbidden … Blocked by Vercel … CVE`:** Vercel refuses to install dependency versions with known security holes. Upgrade the flagged package (for example `npm install --save-exact @tanstack/react-start@latest @tanstack/react-router@latest @tanstack/router-plugin@latest`), commit the updated `package.json` and `package-lock.json`, and push.

---

## Privacy and accessibility

- **Privacy:** the photo is read straight from your device into the page; it is never sent anywhere. Only the player list and embeddings are downloaded.
- **Accessibility:** full keyboard support with visible focus rings, confidence given as text as well as colour, screen-reader labels on the rings and results, touch targets of at least 44 px, both colour themes checked for readable contrast, and animations reduced when your system asks for less motion.

---

## Known limitations

- **20 players only.** Anyone else gets "closest look-alikes", never a real identification.
- **Reference photos are few.** Some players (Smriti Mandhana, Kapil Dev, Shubman Gill) have only one to four usable photos, so their matches can land under the 70% threshold. Adding more reference photos per player is the single biggest accuracy win.
- **Photo quality matters.** Side profiles, sunglasses, helmets, heavy blur or very small faces lower the score.

---

## Credits

- Reference photos: [Wikimedia Commons](https://commons.wikimedia.org), free licences only (GODL-India, CC BY, CC BY-SA, CC0, public domain); each photo's licence is stored in the database.
- Face models: [`@vladmandic/face-api`](https://github.com/vladmandic/face-api).
- Built with [Lovable](https://lovable.dev/projects/cd1b8f9a-f78c-4438-9ca0-df090fea0eee). Changes pushed to `main` sync back into the Lovable editor.
