# Niemiecki z Schritte Plus Neu B1

Strona do nauki niemieckiego na podstawie podręcznika **Schritte Plus Neu B1.1**. Quizy, fiszki i powtórki działają w przeglądarce. Nie trzeba nic budować.

**Adres na żywo:** https://nublogb.github.io/german/

## Lekcje

- [Lektion 4 – Sprachen](https://nublogb.github.io/german/lektion4/) — quiz i fiszki słownictwa
- [Lektion 5 – Eine Arbeit finden](https://nublogb.github.io/german/lektion5/) — quiz i fiszki słownictwa (szukanie pracy)
- [3D Escape Rooms](https://nublogb.github.io/german/3d/) — Kapitel 4 Restaurant · Kapitel 5 Büro

## Jak to jest złożone

Silnik jest jeden, treść lekcji osobno:

- `shared/engine.js` — quiz, fiszki, powtórki (SRS), trasy z hashem i zapis postępu
- `shared/lesson.css` — wspólny wygląd
- `lektion4/data.json`, `lektion5/data.json` — tematy, pytania, słówka, tabele, przypomnienia
- `lektion4/index.html`, `lektion5/index.html` — krótka strona: tytuł, arkusz, start silnika

Dane są zwykłym JSON-em. Skrypt `scripts/check-explanations.mjs` czyta je przez `JSON.parse` (bez `eval`). Strona pobiera `./data.json` ścieżką względną, więc na GitHub Pages działa pod `/german/`.

Podgląd lokalny wymaga serwera statycznego (na przykład `python3 -m http.server` w katalogu repozytorium). Otwarcie pliku HTML wprost z dysku nie pobierze JSON-a.

Postęp zostaje w `localStorage` pod dotychczasowym kluczem: `schritteB1_L4_v1` i `schritteB1_L5_v1`. Tego klucza nie zmieniaj — przeglądarki, które już uczą się z tej lekcji, straciłyby historię.

`3d/` i `spojniki/` są osobnymi stronami i nie korzystają z silnika lekcji.

## Jak dodać Lektion 6

1. Skopiuj `lektion5/index.html` do `lektion6/index.html`. W `<title>` wpisz to samo, co w polu `title` danych.
2. Dodaj `lektion6/data.json`. Skopiuj kształt z `lektion5/data.json` i podmień treść. Ustaw nowy `storeKey`, na przykład `schritteB1_L6_v1`. Nie używaj klucza innej lekcji.
3. Dopisz kartę w `index.html` (siatka `.grid`).
4. Dopisz lekcję w tablicy `EXPECTED` w `scripts/check-explanations.mjs` (liczba pytań, tematów, słówek i grup).
5. Wypchnij zmiany na gałąź `main`.

Najważniejsze pola `data.json`:

- `title`, `storeKey`, `crumb`, `topicsLabel`, `footerNote`, `vocabFallback` — napisy strony i klucz zapisu
- `mix.src`, `mix.reminder` — mieszany test całej lekcji
- `vocabForms` — pary `[forma, polski dopisek]` dokładane do objaśnienia fiszki, gdy forma występuje w przykładzie
- `help` — sekcje okna Info: `{ "title", "html" }`
- `topics` — `id`, `title`, `pl`, `src`, `reminder` (HTML), `questions`, opcjonalnie `isTest`
- pytanie — `t` równe `mc`, `order` albo `type`, oraz `q`, `a` albo `w`, `o` (dla `mc`), `pl`, `lex`, `why`
- `vocabGroups`, `vocab`
- opcjonalnie `customRef` i `customGaps`, gdy lekcja ma zestaw „Moje słówka”

Publikacją zajmuje się GitHub Actions (`.github/workflows/pages.yml`). Najpierw sprawdza dane i odpala test silnika w przeglądarce. Strona na GitHub Pages powstaje tylko wtedy, gdy oba kroki przejdą, i zawiera samą witrynę (bez `scripts/` i narzędzi).
