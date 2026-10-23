# Cricket Face Finder

Product Requirements Document: Indian Cricket Player Face Recognition System

Project Overview

Build a web application that identifies Indian cricket players from uploaded images using machine learning. Users upload a photo, the system analyzes it, and displays the identified player's name along with a confidence score.

Problem Statement

Companies and cricket enthusiasts need an efficient way to identify Indian cricket players from photos. This system automates player identification by analyzing facial features and matching them against a trained dataset of Indian cricket team members.

Core Features

1. Image Upload Interface

Single image upload functionality (drag-and-drop or file picker)

Support for common image formats (JPG, PNG, WebP)

Image preview before submission

Clear, intuitive UI with instructional text

File size validation and error handling

2. Face Detection & Preprocessing

Automatically detect faces in uploaded images

Extract and preprocess facial features

Handle images with multiple faces (identify primary face)

Validate image quality before processing

3. Face Recognition Processing

Integrate a pre-trained face recognition model (TensorFlow.js with face-api.js or similar)

Extract facial feature embeddings from uploaded image

Match against trained cricket player dataset embeddings

Return matched player name and confidence score (0-100%)

Handle cases where no match is found (confidence threshold)

4. Results Display

Show identified player name prominently

Display confidence percentage

Show player image thumbnail and basic info (if available in database)

Display top 3 alternative matches if confidence is moderate

"Try Another Image" button to reset and upload new image

Handle no-match scenarios gracefully ("Player not recognized - Confidence below threshold")

5. Database Integration (Supabase)

Store cricket player profiles with:

Player ID (unique identifier)

Player name

Team/era information

Player image URL

Facial feature embeddings (vector format for matching)

Match history/stats (optional)

Query player database for matching results

No authentication required - public access

Technical Requirements

Frontend: React/Next.js with TypeScript

ML Model: TensorFlow.js with face-api.js for face detection and recognition

Face Recognition Approach: Transfer learning using pre-trained embeddings

Database: Supabase PostgreSQL with vector storage capability

Responsive design (mobile + desktop)

Fast inference (results within 2-3 seconds)

Client-side processing (no backend ML inference needed)

Dataset Requirements

Source: Kaggle (search: "Indian cricket players face dataset") or Google Dataset Search

Minimum: 10-15 prominent Indian cricket players

Images per player: 50-100 high-quality images

Data preprocessing: Face detection, alignment, and normalization

Feature extraction: Convert images to facial embeddings for matching

Train/Test split: 80/20 for validation

Model Training & Evaluation

Use transfer learning (pre-trained CNN model like ResNet or MobileNet)

Extract facial feature vectors from training images

Store embeddings in Supabase for real-time matching

Evaluate using:

Classification accuracy on test set

Confidence score calibration

False positive/negative rates

Set confidence threshold (e.g., 70%) for valid matches

UI/UX Design

Design Language

Theme: Modern "stadium-at-dusk" aesthetic — deep navy/charcoal base (#0B1120), with a vibrant accent gradient inspired by cricket (saffron #FF6B35 → green #0B8457, evoking the Indian flag without being literal about it). Cricket-red (#C8102E) reserved for primary CTAs.

Typography: A geometric sans (e.g., "Inter" or "Sora") for UI chrome; a bolder display face (e.g., "Space Grotesk") for the player name reveal to give it a scoreboard/broadcast feel.

Surface treatment: Glassmorphic cards (subtle blur + translucency) floating over a softly animated background (slow-drifting stadium-light bokeh or a faint cricket-ball seam pattern), rather than a flat white page.

Iconography: Custom line icons (upload, camera, spinner) with a slight hand-drawn/sketch quality to keep it playful rather than clinical.

Dark mode first, with a light theme toggle for accessibility.

Layout & Screens

1. Landing / Upload Screen

Centered hero card with a bold headline ("Who's That Cricketer?") and a one-line subtext.

Large dashed-border dropzone that visually "breathes" (gentle scale pulse, 2s ease-in-out loop) to invite interaction.

Drag-over state: dropzone border animates from dashed-gray to solid accent-gradient, background tints, and an upload icon bounces slightly.

Secondary "or click to browse" link styled as understated text, not a competing button.

Small strip of sample/demo thumbnails below the dropzone ("Try one of these") for users without a photo handy — clicking one fades into the preview state.

2. Preview & Confirm Screen

Uploaded image slides/fades in (300ms ease-out) inside a rounded card with a subtle drop shadow.

If a face is detected, an animated bounding-box/scanning-line effect briefly sweeps across the detected face (reinforcing "the system sees you") before settling into a soft glowing outline.

"Analyze" primary button (gradient fill) and "Choose Different Image" secondary (ghost/outline) button, stacked responsively.

Multiple-faces case: each detected face gets a numbered marker; user taps/clicks to pick the primary one, with the selected marker pulsing.

3. Processing / Loading State

Replace the static spinner with a purpose-built loading sequence that narrates progress rather than a generic circle:

"Detecting face…" (scanning-line animation)

"Extracting features…" (small particle/dot-matrix animation over the face)

"Matching against players…" (a fast-cycling carousel of blurred player silhouettes that gradually sharpens)

Progress communicated via a slim animated gradient bar rather than a percentage number, since exact timing varies.

All copy and transitions timed to resolve within the 2–3s inference budget; if it runs long, gracefully shift to a reassuring "Almost there…" state rather than stalling silently.

4. Results Screen

Reveal animation: player name and photo scale-and-fade in with a slight spring/overshoot (like a scoreboard flipping to a new name), accompanied by a subtle confetti or light-ray burst for high-confidence matches (>90%) — omitted for lower-confidence results to avoid false celebration.

Confidence score: shown as an animated circular progress ring that fills from 0 to the final value (~800ms ease-out), color-coded (green ≥85%, amber 60–84%, red/gray <60%).

Match card: player photo, name, team/era badge, laid out like a cricket trading card with a soft glare/sheen effect on hover.

Alternative matches: shown as a horizontally scrollable row of smaller cards ("Could also be…") for moderate-confidence results, each with its own mini confidence ring; cards stagger-animate in (50ms delay between each).

No-match state: friendly illustration (e.g., a magnifying glass over a silhouette) with empathetic copy ("We couldn't find a confident match") instead of a bare error message — avoids feeling like a failure state.

"Try Another Image" button transitions the results out (fade + slight upward exit) and the upload dropzone back in, rather than a hard page reload.

Micro-interactions

Buttons: subtle scale-down (0.97x) on press for tactile feedback; gradient buttons shift hue slightly on hover.

Toasts/errors (invalid file type, upload failure) slide in from the top, auto-dismiss after 4s, dismissible early.

Skeleton loaders (shimmer effect) for the player database card while thumbnails/info load, instead of layout jump.

Page transitions between the four screens use a consistent shared-element pattern (the uploaded image morphs from preview position to its final results-card position) so the flow feels continuous rather than a series of disconnected screens.

Accessibility & Responsiveness

All animations respect prefers-reduced-motion, falling back to simple opacity fades or instant state changes.

Confidence conveyed through both color AND numeric/text label (not color alone) for color-blind accessibility.

Touch targets ≥44px on mobile; dropzone becomes a tap-to-open-camera-or-gallery button on small screens.

Focus states clearly visible for keyboard navigation; results announce via aria-live region for screen readers.

Layout collapses gracefully: two-column (upload + demo strip) on desktop → single column stacked on mobile.

Suggested Front-End Tooling

Animation: Framer Motion (React) for screen transitions, spring physics on reveals, and the shared-element morph between upload and results.

Micro-interactions/particles: a lightweight canvas or CSS-based particle effect for the confetti/scanning-line moments (avoid heavy libraries given the 2–3s performance budget).

Styling: Tailwind CSS with a custom design-token theme (colors, radii, shadows defined above) for consistency and fast iteration.

Non-Functional Requirements

Clean, modern UI with cricket theme (see UI/UX Design above)

Loading state with spinner during image processing (see Processing / Loading State above)

Error handling for invalid/corrupt images

Error handling for network failures

Responsive across devices (phones, tablets, desktop)

Fast page load time

Out of Scope

User accounts, sign-in, or authentication

Image upload storage (use URLs from Supabase or external storage)

Video processing or live camera feed

Batch processing of multiple images

Historical tracking or user profiles

Admin dashboard for model management

Success Metrics

Correctly identifies known players with 85%+ accuracy

Returns results within 2-3 seconds

Handles edge cases (partial faces, poor lighting) gracefully

Zero crashes on invalid input

Mobile-responsive and user-friendly interface

User Flow

User opens application

Uploads or drags image of cricket player

System detects face and shows preview

Processing spinner shows while analyzing

Results display with player name and confidence

User can try another image or view player details use the attached image as the logo everywhere needed

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cd1b8f9a-f78c-4438-9ca0-df090fea0eee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
