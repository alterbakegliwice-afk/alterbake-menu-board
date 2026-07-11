# ALTERBAKE — przekazanie stylu graficznego

> Dokument przekazania dla projektu **store-order** (i każdego kolejnego).
> Napisany tak, żeby agent (Claude Code) albo developer mógł wdrożyć styl
> bez zaglądania do repozytorium `alterbake-menu-board`. Wszystko, co
> potrzebne, jest w tym pliku. Źródło prawdy stylu: tablica menu
> https://alterbakegliwice-afk.github.io/alterbake-menu-board/

## 1. Czym jest ten styl

**„Bakery bold editorial"** — czarny tusz na ciepłym papierze, ciężki
grotesk w nagłówkach, ramki zamiast cieni, jeden powściągliwy akcent.
Wygląda jak dobrze złożony szyld rzemieślniczej piekarni, nie jak aplikacja.

Lockup marki (zawsze w tej kolejności i proporcji):

```
PIEKARNIA RZEMIEŚLNICZA        <- kicker: 11px, 700, letter-spacing 0.16em, uppercase, kolor muted
ALTERBAKE                      <- logotyp: Anton, uppercase, letter-spacing -0.015em, line-height 0.92
stara piekarnia od nowa        <- tagline: 17px, 500, kolor muted
```

Między kickerem a logotypem ~10px światła. Motto stopki:
`ZAKWAS · CZAS · GLIWICE` (12px, 700, letter-spacing 0.18em, uppercase).

## 2. Paleta (tokeny CSS — wklej 1:1)

```css
:root {
  --ink: #1d1b18;                      /* czarny tusz: tekst, ramki, wypełnienia */
  --muted: #6f6a61;                    /* ciepła szarość: metadane, kickery */
  --soft: #57524a;                     /* ciemniejsza szarość: opisy */
  --bg-top: #f6f4ee;                   /* papier: tło strony (góra gradientu) */
  --bg-bottom: #edeae1;                /* papier: tło strony (dół gradientu) */
  --card: #fdfcf8;                     /* karta na papierze */
  --card-strong: #fffef9;              /* karta wyróżniona / hero */
  --hairline: rgba(29, 27, 24, 0.12);  /* włosowate linie podziału */
  --frame: rgba(29, 27, 24, 0.2);      /* ramki kart */
  --champagne: #c9a86a;                /* JEDYNY akcent: stemple, wyróżnienia */
  --radius: 14px;                      /* karty */
  --radius-sm: 8px;                    /* hero, mniejsze elementy */
}

body {
  background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}
```

Kontrasty sprawdzone (WCAG): `--ink` na papierze ~13:1, `--soft` ~7:1,
`--muted` ~4.6:1 (używaj od 11px wzwyż, 700). Akcent `--champagne` nigdy
jako kolor tekstu na jasnym tle — tylko tła stempli i cienkie linie.

## 3. Typografia

| Rola | Krój | Zasady |
|---|---|---|
| Logotyp ALTERBAKE | **Anton** (SIL OFL) | uppercase, letter-spacing −0.015em, line-height 0.92; tylko logotyp |
| Nagłówki sekcji/kategorii | **Archivo Black** (SIL OFL) | uppercase, 16–20px, letter-spacing 0.1em, wyśrodkowane, cienka linia pod spodem |
| Nazwy produktów | czcionka systemowa **800** | 20–26px, letter-spacing −0.005em |
| Opisy, metadane | czcionka systemowa 400/500 | 14–17px, kolor `--soft` / `--muted` |
| Ceny | czcionka systemowa **800** | `font-variant-numeric: tabular-nums`, czysty tusz — NIGDY w pigułce |

Instalacja fontów (offline, bez CDN — zero requestów do sieci w runtime):

```bash
npm i -D @fontsource/anton @fontsource/archivo-black
# skopiuj do public/fonts/ (lub odpowiednika) pliki:
#   anton-latin-400-normal.woff2 + .woff
#   anton-latin-ext-400-normal.woff2 + .woff        <- polskie znaki!
#   archivo-black-latin-400-normal.woff2 + .woff
#   archivo-black-latin-ext-400-normal.woff2 + .woff
# skopiuj też LICENSE każdego fontu (SIL OFL wymaga dołączenia licencji)
```

```css
@font-face {
  font-family: "Anton";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src:
    url("fonts/anton-latin-ext-400-normal.woff2") format("woff2"),
    url("fonts/anton-latin-ext-400-normal.woff") format("woff");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Anton";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src:
    url("fonts/anton-latin-400-normal.woff2") format("woff2"),
    url("fonts/anton-latin-400-normal.woff") format("woff");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* Archivo Black: te same dwa bloki, podmień nazwy plików i rodziny. */
```

Pliki `.woff` obok `.woff2` są celowe — stare Safari (iPad 2 / iOS 9,
którego używamy w sklepie) nie zna woff2.

## 4. Komponenty (przepisy)

### Karta / panel
```css
.card {
  padding: 14px 18px;
  border: 1px solid var(--frame);
  border-radius: var(--radius);
  background: var(--card);
}
```
Bez cieni, bez gradientów na kartach, bez przezroczystości i blura.
Struktura = ramki i światło, nie efekty.

### Hero / najważniejszy element ekranu
Jasna karta w **czarnej ramce 2px** (`--radius-sm`) z czarną zakładką
nachodzącą na górną krawędź:
```css
.hero { border: 2px solid var(--ink); border-radius: var(--radius-sm); background: var(--card-strong); padding: 13px 26px 15px; }
.hero .tab {
  display: inline-block;
  margin-top: -24px;            /* zakładka wystaje ponad ramkę */
  padding: 6px 14px;
  background: var(--ink);
  color: #faf7f0;
  border-radius: 4px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
```

### Cena
Czysty gruby tusz, zakotwiczona w prawym górnym rogu pozycji, jednostka
drobna pod spodem, wyrównana do prawej:
```css
.price strong { font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }
.price span   { font-size: 11px; font-weight: 500; color: var(--muted); }
```

### Stemple / plakietki statusu
Kwadratowsze etykiety jak stemple na papierze. Semantyka: **obrys =
status neutralny**, **wypełnienie szampanem = wyróżnienie**:
```css
.badge {           /* np. W CZWARTEK, WYPRZEDANE */
  padding: 3px 9px;
  border: 1px solid rgba(29, 27, 24, 0.28);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.55);
  color: var(--soft);
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
}
.badge.accent {    /* np. BESTSELLER */
  border-color: rgba(185, 151, 91, 0.4);
  background: rgba(201, 168, 106, 0.32);
  color: #4f3f24;
}
```

### Przyciski (mapowanie na aplikację)
- **Primary** (złóż zamówienie, zapisz): wypełniony `--ink`, tekst `#faf7f0`,
  radius 8px — jak czarna zakładka hero.
- **Secondary** (anuluj, wstecz): przezroczysty, `1px solid var(--frame)`,
  tekst `--ink`, radius 8px — jak stempel.
- Stany `:active`: tło `rgba(201, 168, 106, 0.25)` (muśnięcie szampanem).
- Duże pola dotykowe (min. 44px wysokości) — obsługa stuka w pośpiechu.

### Wyróżniony wiersz listy
```css
.row-highlight {
  border-left: 2px solid var(--champagne);
  background: rgba(201, 168, 106, 0.09);
  border-radius: var(--radius-sm);
}
```

## 5. Layout i rytm

- Jeden stały rytm pionowy między sekcjami: **18px**. Pola strony
  symetryczne (24px góra/dół).
- Krawędzie wszystkich sekcji **w jednym licu** (masthead, hero, listy,
  stopka — jedna linia pionowa z lewej i prawej).
- Światła między kolumnami/kartami identyczne (16px).
- Formularze/listy: separatory `--hairline`, nigdy pełne obramowania
  każdego wiersza.

## 6. Twarde zasady (do / don't)

✅ zawsze jasno — czarny tusz na papierze (ciemny ekran odbija światło w sklepie)
✅ jeden akcent (szampan) — reszta monochromatyczna
✅ ramki i światło zamiast cieni; płaskie karty
✅ polska typografia: `&shy;` w bardzo długich słowach (np. `długo&shy;dojrze&shy;wający`), twarda spacja po jednoliterowych przyimkach (`z&nbsp;kruszonką`, `w&nbsp;tygodniu`)
✅ fonty self-hosted (SIL OFL), woff2 + woff, zero CDN-ów

❌ żadnych cieni box-shadow na kartach, gradientów na elementach, glassmorphizmu/blura
❌ Anton wyłącznie dla logotypu — nie do nagłówków treści
❌ ceny nigdy w pigułkach/chipach — czysty gruby tusz
❌ czerwieni/zieleni alarmowych — statusy mówią typografią i stemplami
❌ emoji i clipartów; symbole tylko jeśli klient o nie poprosi

## 7. Wskazówki dla agenta wdrażającego w store-order

1. Zacznij od tokenów (§2) i fontów (§3) — podłącz globalnie, nic więcej
   nie zmieniaj, zrób zrzut przed/po.
2. Przemapuj istniejące komponenty wg §4 (przyciski → primary/secondary,
   statusy zamówień → stemple, nagłówki ekranów → Archivo Black,
   podsumowanie zamówienia → hero z zakładką, kwoty → wzór ceny).
3. Wyrównaj rytm (§5): jedno lico krawędzi, 18px między sekcjami.
4. Sprawdź kontrasty po zmianach (muted ≥ 4.5:1 dla drobnego tekstu).
5. Nie przenoś mechaniki menu-boardu (tryb edycji, localStorage) — to
   przekazanie dotyczy wyłącznie warstwy wizualnej.

Pełna implementacja wzorcowa: `styles.css` + `index.html` w repozytorium
`alterbakegliwice-afk/alterbake-menu-board` (gałąź PR #7 / main po scaleniu).
Materiały referencyjne (plakat, ulotka, social): katalog `materials/out/`.
