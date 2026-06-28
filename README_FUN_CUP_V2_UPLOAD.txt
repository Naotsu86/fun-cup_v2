# fun-cup_v2 Upload

Wichtig:
Dieses Paket ist nur der Overlay-Patch für das neue Repository.
Die eigentlichen App-Dateien kommen aus deinem bisherigen Branch `v2-avatar-system`.

## Vorgehen

1. Im alten Repository `bohemian-fun-cup` den Branch `v2-avatar-system` auswählen.
2. Code → Download ZIP.
3. ZIP entpacken.
4. Den Inhalt des entpackten Ordners komplett ins neue Repository `fun-cup_v2` hochladen.
5. Danach diese Overlay-Dateien aus diesem Paket hochladen/ersetzen:
   - .github/workflows/deploy.yml
   - vite.config.js
6. In `fun-cup_v2`:
   Settings → Pages → Source = GitHub Actions
7. Commit auf main.
8. Testseite:
   https://naotsu86.github.io/fun-cup_v2/

## Supabase

Datenbank muss nicht neu gemacht werden.
Du kannst dasselbe Supabase-Projekt weiterverwenden.

Bitte in Supabase prüfen:

Authentication → URL Configuration

Site URL:
https://naotsu86.github.io/fun-cup_v2/

Redirect URLs zusätzlich erlauben:
https://naotsu86.github.io/fun-cup_v2/**
http://localhost:5173/**

Falls Login lokal getestet wird, localhost drin lassen.

## Späteres Übertragen zurück auf Version 1

Wenn Version 2 fertig ist:
- Dateien aus `fun-cup_v2` nach `bohemian-fun-cup` kopieren
- in vite.config.js die base-Zeile zurück ändern auf:
  base: '/bohemian-fun-cup/'
