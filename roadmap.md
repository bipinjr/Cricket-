# Roadmap

- [x] Design system, logo/favicon, database tables for players + face data
- [x] Upload → preview → processing → results flow with confidence scoring
- [x] Re-run photo analysis storing every detected face, so group photos pick the right person
- [x] Re-seed the 20 players with verified faces and clean portrait photos
- [x] Make the project deployable to Vercel
- [x] Final end-to-end verification (recognition + build)

Known limitation: a few players (Smriti Mandhana, Kapil Dev, Shubman Gill) have
only a handful of usable reference photos, so they can fall below the 70%
confidence threshold. More photos per player is the biggest accuracy win left.
