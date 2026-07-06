# AlterBake Menu Board

Statyczna tablica menu dla iPada w trybie kioskowym. Działa bez backendu, bazy danych, logowania, analityki i zewnętrznych usług.

## Pliki

- `index.html` - gotowy widok menu.
- `styles.css` - wygląd i responsywność.
- `board.js` - tryb obsługi: statusy dostępności zmieniane stuknięciami na iPadzie.
- `products.json` - prosta lista produktów do edycji.
- `products.sample.json` - zapasowy przykład danych.

## Statusy dostępności w ciągu dnia

Pieczywo wyprzedaje się po południu, a nie rano - dlatego statusy można zmieniać bezpośrednio na iPadzie przy ladzie, bez edycji plików:

1. Stuknij 5 razy szybko w logo `AlterBake` - włączy się tryb edycji (pasek na dole ekranu).
2. W trybie edycji:
   - **stuknięcie w produkt** przełącza stan: dostępne → `OSTATNIE SZTUKI` → `WYPRZEDANE` → dostępne,
   - **przytrzymanie produktu** (pół sekundy) przenosi złote wyróżnienie - rano wyróżniaj bestseller, po południu to, co trzeba sprzedać,
   - **stuknięcie w panel WYPIEK DNIA** podmienia wypiek na kolejny dostępny produkt z kolumn (pełny cykl wraca do oryginału),
   - **przycisk Wieczór** zmienia komunikat na "KOŃCÓWKA DNIA / ostatnie wypieki" (przycisk `Dzień` przywraca).
3. Stuknij `Zakończ` (albo odczekaj 45 sekund) - tryb się wyłączy.

Zasady działania:

- Wszystkie zmiany zapisują się w pamięci iPada (localStorage) i przeżywają odświeżenie strony. Działa offline, bez żadnego serwera.
- Następnego dnia zmiany kasują się same - rano tablica startuje od stanu z `index.html` (świeży wypiek, tryb dzienny).
- Gdy oznaczysz wypiek dnia jako wyprzedany, panel sam wraca do oryginalnego wypieku.
- Produkty wyprzedane "od rana" (bez ceny w HTML, jak Orkiszowy) nie są przełączalne stuknięciami - wracają na ladę przez edycję `products.json` i `index.html`.
- Teksty trybu wieczornego można zmienić na górze `board.js`.
- Bez `board.js` tablica działa normalnie jako czysty statyczny HTML.

W danych (`products.json`) poziom zapasu opisuje pole `stockLevel`: `dostępne`, `ostatnie-sztuki` albo `wyprzedane` (musi zgadzać się z `soldOut`; testy tego pilnują).

## Test na iPadzie

1. Umieść cały folder `alterbake-menu` na serwerze, dysku lokalnym albo w prostym hostingu statycznym.
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

Gotowe PNG: `npm run materials` (pliki trafiają do `materials/out/`). Bez Node'a: otwórz szablon w przeglądarce i zrób zrzut ekranu.

Sama tablica ma też układ do druku - wystarczy otworzyć `index.html` i wybrać Drukuj, a menu ułoży się jako czysty cennik A4.

Więcej pomysłów na wykorzystanie projektu: `docs/MARKETING.md`.

## Testy

`npm test` uruchamia walidację danych (`products.json`), spójności JSON z HTML, poprawności HTML oraz testy wizualne (zrzuty ekranu dla iPada i mniejszych ekranów). Po celowej zmianie wyglądu odśwież bazowe zrzuty: `npm run test:update-snapshots`.

## Brak zależności

Sama tablica używa tylko HTML i CSS. Nie ma backendu, frameworków, baz danych, logowania, analityki ani usług zewnętrznych. Node.js jest potrzebny wyłącznie deweloperom do testów i generowania grafik - nic z `node_modules` nie trafia na iPada.
