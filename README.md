# AlterBake Menu Board

Statyczna tablica menu dla iPada w trybie kioskowym. Działa bez backendu, bazy danych, logowania, analityki i zewnętrznych usług.

## Pliki

- `index.html` - gotowy widok menu.
- `styles.css` - wygląd i responsywność.
- `products.json` - prosta lista produktów do edycji.
- `products.sample.json` - zapasowy przykład danych.

## Test na iPadzie

1. Umieść pliki z katalogu głównego repozytorium (`index.html`, `styles.css`, `products.json`) na serwerze, dysku lokalnym albo w prostym hostingu statycznym.
2. Otwórz `index.html` w Safari na iPadzie.
3. Sprawdź widok w orientacji poziomej.
4. Obróć iPada do orientacji pionowej i odśwież stronę.
5. Stań 1-2 metry od ekranu i sprawdź, czy nazwy produktów, ceny i jednostki są czytelne.

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

## Brak zależności

Projekt używa tylko HTML i CSS. Nie ma backendu, frameworków, baz danych, logowania, analityki ani usług zewnętrznych.
