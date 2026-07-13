# Struktura projektu

## Główne pliki aplikacji

- `index.html` - Szablon HTML tablicy menu (główny widok)
- `board.js` - Logika obsługi trybu edycji PIN + zmiana stanów produktów
- `styles.css` - Wygląd i responsywność dla iPad/mobilnych

## Dane produktów

- `products.json` - Aktualny katalog produktów wyświetlanych na tablicy
- `products.sample.json` - Przykładowy plik do referecji
- `data/` - Katalog z danymi źródłowymi (export z formularza zamówień)

## Zasoby

- `fonts/` - Lokalne pliki fontów (Anton, Archivo Black, Fraunces) - SIL OFL
- `materials/` - Szablony i gotowe materiały sprzedażowe:
  - `ulotka-a4.html` - Ulotka A4
  - `social-story.html` - Story Instagram 1080x1920
  - `social-post.html` - Post Instagram/Facebook 1080x1080
  - `plakat-witryna.html` - Plakat A4 z kodem QR
  - `qr-instagram.svg` - Kod QR

## Testy i konfiguracja

- `tests/` - Testy automatyczne:
  - `validate-products.js` - Walidacja struktury products.json
  - `validate-html.js` & `validate-html-sync.js` - Walidacja HTML
  - `render-materials.js` - Renderowanie materiałów sprzedażowych
  - Testy E2E (Playwright)
  - Testy wizualne (snapshoty)
  
- `playwright.config.js` - Konfiguracja testów E2E
- `.htmlvalidate.json` - Reguły walidacji HTML
- `package.json` - Zależności Node.js i skrypty

## Dokumentacja

- `README.md` - Główna dokumentacja (instrukcja obsługi, testowanie, edycja)
- `docs/STRUCTURE.md` - Ten plik
- `docs/MARKETING.md` - Pomysły na marketing i promocję
- `.github/workflows/` - Automatyzacja GitHub Actions
