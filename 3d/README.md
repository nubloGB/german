# Deutsch Escape 3D – Restaurant (Kapitel 4) & Büro (Kapitel 5)

Statyczna aplikacja (Three.js 0.160, lokalnie w `js/`), bez budowania. Wszystkie ścieżki są względne,
więc działa w podkatalogu (np. `https://nublogb.github.io/german/3d/`).

Lokalnie: `python3 -m http.server 8000` → http://localhost:8000/

- `index.html`, `style.css` – UI
- `js/app.js` – silnik (kamera FPS, kolizje, zadania, trening, słówka, timer)
- `js/core.js` – helpery i modele (krzesła, rośliny, postacie…)
- `js/rooms/restaurant.js`, `js/rooms/office.js` – pokoje (obiekty, zadania, słówka, kod do drzwi)
- `thumbs/` – miniatury ekranu startowego
- `tools/` – skrypty testowe (Playwright + swiftshader); `?manual` = ręczny zegar, `?debug` = kolizje, `?touch` = tryb dotykowy, `#restaurant` / `#office` = od razu pokój
