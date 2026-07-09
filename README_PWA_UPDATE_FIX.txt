PWA Update Fix

Upload/ersetzen:
- vite.config.js
- package.json
- src/main.js
- src/App.vue

Geändert:
- start_url korrigiert von /bohemian-fun-cup/ auf /fun-cup_v2/
- scope korrekt auf /fun-cup_v2/
- Service Worker aktualisiert alte Dateien automatisch
- cleanupOutdatedCaches aktiviert
- skipWaiting / clientsClaim aktiviert
- App-Version sichtbar unten rechts: v6.0.1

Nach dem Deploy auf iPhone:
1. Safari öffnen und Seite direkt aufrufen.
2. Einmal neu laden.
3. Home-Bildschirm-App öffnen.
4. Falls sie trotzdem hängt: Home-Bildschirm-App einmal löschen und neu hinzufügen.

Hinweis:
iOS ist bei PWAs sehr hartnäckig. Ab diesem Patch sollten zukünftige Deployments deutlich zuverlässiger aktualisieren.
