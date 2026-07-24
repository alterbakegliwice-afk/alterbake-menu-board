# AlterBake Menu Board

> **⚠️ ZMIGROWANO DO MONOREPO ALTERBAKE OS (2026-07-24).**
> Kod tego repozytorium żyje teraz w `alterbake-ai-dashboard` w katalogu `apps/menu/`
> (gałąź konsolidacyjna `claude/alterbake-routing-consolidation-lfze3v`; po scaleniu — `main`),
> pod wspólną powłoką z routingiem `#/`. Tam prowadź dalszy rozwój — to repozytorium
> pozostaje archiwum historii sprzed konsolidacji.


Statyczna tablica menu dla iPada w trybie kioskowym. Działa bez backendu, bazy danych, logowania, analityki i zewnętrznych usług.

## Pliki

- `index.html` - gotowy widok menu.
- `styles.css` - wygląd i responsywność.
- `board.js` - tryb obsługi: statusy dostępności zmieniane stuknięciami na iPadzie.
- `gazetka.html` - gazetka dla klientów: co dziś na ladzie (ceny z `products.json`); cel linków z zaproszeń.
- `zaproszenia.html` - panel obsługi: trzy przyciski "zaproś klientów" (Telegram/WhatsApp) + dziennik stuknięć dzień×pora. Instrukcja: `docs/GAZETKA.md`.
- `products.json` - prosta lista produktów do edycji.
- `products.sample.json` - zapasowy przykład danych.
- `fonts/` - lokalne pliki fontów (licencje SIL OFL): Anton (logotyp), Archivo Black (nagłówki kategorii), Fraunces (materiały drukowane). Nic nie jest pobierane z internetu; obok woff2 leżą pliki woff dla starszego Safari (iPad 2 / iOS 9).

Wszystkie pliki tablicy leżą w katalogu głównym repozytorium - jedna kopia, bez duplikatów.

## Statusy dostępności w ciągu dnia

Pieczywo wyprzedaje się po południu, a nie rano - dlatego statusy można zmieniać bezpośrednio na iPadzie przy ladzie, bez edycji plików:

1. Stuknij 5 razy szybko w logo `AlterBake` i podaj PIN obsługi - włączy się tryb edycji (pasek na dole ekranu). Domyślny PIN to `1234` - **zmień go przed użyciem w sklepie** w stałej `PIN_CODE` na górze `board.js`.
2. W trybie edycji:
   - **stuknięcie w produkt** przełącza stan: dostępne → `OSTATNIE SZTUKI` → `WYPRZEDANE` → dostępne,
   - **przytrzymanie produktu** (pół sekundy) przenosi złote wyróżnienie - rano wyróżniaj bestseller, po południu to, co trzeba sprzedać,
   - **stuknięcie w panel WYPIEK DNIA** podmienia wypiek na kolejny dostępny produkt z kolumn (pełny cykl wraca do oryginału),
   - **przycisk Wieczór** zmienia komunikat na "KOŃCÓWKA DNIA / ostatnie wypieki" (przycisk `Dzień` przywraca). Tablica celowo zostaje jasna także wieczorem - ciemny ekran w witrynie odbija światło i słabo czyta się na starszym iPadzie.
3. Stuknij `Zakończ` (albo odczekaj 45 sekund) - tryb się wyłączy.

Zasady działania:

- Wszystkie zmiany zapisują się w pamięci iPada (localStorage) i przeżywają odświeżenie strony. Działa offline, bez żadnego serwera.
- Następnego dnia zmiany kasują się same - rano tablica startuje od stanu z `index.html` (świeży wypiek, tryb dzienny). Działa to też, gdy iPad chodzi non stop: po zmianie daty tablica sama się przeładowuje.
- Tryb edycji chroni PIN, a klawiatura i tryb edycji zamykają się same po chwili bezczynności - klienci nie zmienią nic przypadkowym stukaniem.
- Gdy oznaczysz wypiek dnia jako wyprzedany, panel sam wraca do oryginalnego wypieku.
- Produkty wyprzedane "od rana" (bez ceny w HTML, jak Orkiszowy) nie są przełączalne stuknięciami - wracają na ladę przez edycję `products.json` i `index.html`.
- Teksty trybu wieczornego można zmienić na górze `board.js`.
- Bez `board.js` tablica działa normalnie jako czysty statyczny HTML.

W danych (`products.json`) poziom zapasu opisuje pole `stockLevel`: `dostępne`, `ostatnie-sztuki` albo `wyprzedane` (musi zgadzać się z `soldOut`; testy tego pilnują).

## Test na iPadzie

1. Umieść pliki z katalogu głównego repozytorium (`index.html`, `styles.css`, `products.json`) na serwerze, dysku lokalnym albo w prostym hostingu statycznym.
2. Otwórz `index.html` w Safari na iPadzie.
3. Sprawdź widok w orientacji poziomej - całe menu mieści się na jednym ekranie, bez przewijania.
4. Obróć iPada do orientacji pionowej i odśwież stronę - również bez przewijania.
5. Stań 1-2 metry od ekranu i sprawdź, czy nazwy produktów, ceny i jednostki są czytelne.

Uwaga: sekcja "Dziś polecamy" jest ukryta na ekranie (tryb kioskowy) - polecane produkty są wyróżnione złotym paskiem w kolumnach. Treść sekcji żyje dalej w `products.json` i materiałach marketingowych.

## Dodanie do ekranu początkowego

1. Otwórz stronę w Safari.
2. Dotknij przycisku udostępniania.
3. Wybierz `Do ekranu początkowego`.
4. Nazwij skrót, np. `AlterBake Menu`.
5. Uruchom stronę z ikony na ekranie początkowym.

Najlepiej testować po dodaniu do ekranu początkowego, bo widok jest bliższy trybowi pełnoekranowemu/kioskowemu.

Na sklepowym iPadzie włącz dodatkowo **Dostęp nadzorowany** (Ustawienia → Dostępność → Dostęp nadzorowany): blokuje wyjście z przeglądarki i przyciski sprzętowe, więc klient nie otworzy innych stron ani nie zamknie tablicy.

## Tryb offline

Strona nie pobiera fontów, obrazów, skryptów ani ikon z internetu. Po zapisaniu folderu lokalnie lub po załadowaniu z hostingu statycznego wszystkie potrzebne pliki są w tym folderze.

Do najpewniejszego testu offline:

1. Otwórz stronę raz przy dostępie do plików.
2. Wyłącz Wi-Fi.
3. Odśwież lub otwórz stronę ponownie z tego samego lokalnego folderu/hostingu.
4. Sprawdź, czy widok pozostaje kompletny.

## Edycja produktów

Produkty są opisane w `products.json`. Plik jest przygotowany tak, żeby można było łatwo zmieniać:

- `name` - nazwa produktu.
- `description` - krótki opis.
- `price` - cena, np. `12 zł`.
- `unit` - jednostka, np. `/ porcja`.
- `category` - sekcja menu.
- `tag` - opcjonalne oznaczenie, np. `Dziś`.
- `soldOut` i `status` - informacja o wyprzedaniu.

Ważne: aktualny widok `index.html` jest statyczny dla maksymalnej niezawodności na starszym iPadzie. Po zmianie danych w `products.json` przenieś te same treści do odpowiednich produktów w `index.html`.

## Materiały sprzedażowe i marketingowe

W katalogu `materials/` są szablony w tej samej stylistyce co tablica:

- `ulotka-a4.html` - ulotka-cennik A4 do druku (z sekcją "Dlaczego my").
- `social-story.html` - Instagram Story 1080x1920 z wypiekiem dnia.
- `social-post.html` - post Instagram/Facebook 1080x1080 "Dziś polecamy".
- `plakat-witryna.html` - plakat A4 na witrynę/sztalugę z kodem QR do Instagrama.
- `qr-instagram.svg` - kod QR do profilu @alterbake (wygenerowany raz, plik lokalny).

Gotowe PNG: `npm run materials` (pliki trafiają do `materials/out/`). Bez Node'a: otwórz szablon w przeglądarce i zrób zrzut ekranu.

Sama tablica ma też układ do druku - wystarczy otworzyć `index.html` i wybrać Drukuj, a menu ułoży się jako czysty cennik A4.

## Menu online (GitHub Pages)

Push do gałęzi `main` publikuje pliki tablicy jako stronę pod adresem `https://alterbakegliwice-afk.github.io/alterbake-menu-board/` (workflow `.github/workflows/pages.yml`). Wymaga jednorazowego włączenia: Settings → Pages → Source: **GitHub Actions**. Link nadaje się do bio na Instagramie i wizytówki Google.

Więcej pomysłów na wykorzystanie projektu: `docs/MARKETING.md`.

## Testy

`npm test` uruchamia walidację danych (`products.json`), spójności JSON z HTML, poprawności HTML, testy e2e trybu obsługi oraz testy wizualne (zrzuty ekranu dla iPada i mniejszych ekranów). Po celowej zmianie wyglądu odśwież bazowe zrzuty: `npm run test:update-snapshots`.

Każdy push do repozytorium przechodzi te testy automatycznie na GitHubie (`.github/workflows/tests.yml`) - także zmiany robione przez stronę GitHuba. Na CI pomijane są tylko porównania zrzutów ekranu (zależą od wersji przeglądarki).

## Brak zależności

Tablica to HTML, CSS i jeden mały plik JavaScript (`board.js` - tryb obsługi; bez niego tablica działa jako czysty statyczny HTML). Nie ma backendu, frameworków, baz danych, logowania, analityki ani usług zewnętrznych - strona nie wykonuje żadnych połączeń z internetem. Node.js jest potrzebny wyłącznie deweloperom do testów i generowania grafik - nic z `node_modules` nie trafia na iPada.
