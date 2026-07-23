# Gazetka AlterBake — zaproszenia jednym stuknięciem

Kanał własny zamiast wynajmowanego zasięgu: obsługa jednym stuknięciem
zaprasza zapisanych klientów na grupę produktów, a czasy stuknięć budują
mapę, kiedy i na co trzeba zapraszać (czyli gdzie bywa nadprodukcja).

## Jak to działa

```
telefon obsługi                    klient
┌─────────────────┐   Telegram /   ┌──────────────────┐
│ zaproszenia.html │ ──WhatsApp──▶ │ powiadomienie     │
│ [Na słodkie]     │   (kanał)     │ + link            │
│ [Po chleb]       │               └────────┬─────────┘
│ [Po bułki]       │                        ▼
│ dziennik stuknięć│               gazetka.html?grupa=…
└─────────────────┘               (ceny z products.json)
```

- **`zaproszenia.html`** — panel obsługi (dodać do ekranu początkowego
  telefonu). Stuknięcie w grupę: składa wiadomość (rotujące treści +
  aktualne ceny z `products.json`), otwiera Telegram z gotowym postem
  albo kopiuje tekst dla Kanału WhatsApp, zapisuje czas w dzienniku.
- **`gazetka.html`** — strona, na którą prowadzi link. `?grupa=slodkie|
  chleby|bulki` podbija zaproszoną grupę na górę w mocnej ramie.
- **Dziennik** — tabela dzień×pora na dole panelu + eksport CSV.
  Regularne zapraszanie w tym samym oknie = sygnał do korekty produkcji
  albo stałej pory promocji.

## Uruchomienie (raz, ~15 minut)

1. **Kanał Telegram**: `t.me/alterbake` (zarejestrowany ✓). Telefon
   obsługi musi być adminem kanału.
2. **Kanał WhatsApp** (opcjonalnie, drugi kanał dla klientów bez Telegrama):
   WhatsApp → Aktualizacje → Utwórz kanał. Postów nie da się automatyzować —
   panel przygotowuje tekst do wklejenia (przycisk „Kopiuj").
3. Na telefonie obsługi otwórz
   `https://alterbakegliwice-afk.github.io/alterbake-menu-board/zaproszenia.html`
   → Udostępnij → **Dodaj do ekranu początkowego**.
4. Wydrukuj plakietkę przy kasę: `materials/plakietka-lada.html`
   (A5, QR do `t.me/alterbake` w środku — plik `materials/qr-telegram.svg`).
   Lada rekrutuje subskrybentów, nie internet.

## Zasady użycia (żeby kanał żył długo)

- Zapraszaj, gdy jest **powód**: świeża blacha, dopieczona druga partia,
  czwartkowy gryczany, końcówka dnia. Nie więcej niż 1–2 zaproszenia dziennie.
- Wiadomość mówi prawdę: „do wyprzedania" — jeśli coś się skończyło,
  zaznacz to w `products.json` (gazetka pokaże przekreślone).
- Treści dobierają się same wg **pory dnia** (rano / popołudnie /
  końcówka po 17:00) i rotują wg dnia tygodnia — zaproszenie z godziny 19
  nigdy nie powie "właśnie wyszły z pieca". Edycja: sekcja `TEMPLATES`
  w `zaproszenia.html`.

## Analiza dziennika

Panel liczy stuknięcia w oknach Pn–Nd × (6–10 / 10–14 / 14–18 / 18–22).
Interpretacja:
- **powtarzalne okno** (np. wtorki 14–18 „S3") → w te dni po południu
  zostaje za dużo słodkiego: mniejszy wypiek albo stała „słodka godzina",
- **brak stuknięć w grupie** → grupa się wyprzedaje sama; nie ruszać,
- CSV (`Pobierz dziennik`) można wkleić do arkusza i skrzyżować z danymi
  sprzedaży ze store-order.

Dziennik żyje w localStorage telefonu obsługi. **Uwaga (iOS/Safari):
jeśli strona nie będzie otwierana przez ~7 dni, system może wyczyścić
ten magazyn** — dlatego raz w tygodniu pobierz CSV (nawyk: niedziela
wieczorem). Niezależnie od tego historia postów na kanale Telegram jest
drugim, trwałym logiem z godzinami.

## Integracja ze store-order (etap 2)

Docelowo przyciski mogą mieszkać w aplikacji store-order i wysyłać
zaproszenie bez otwierania Telegrama:

1. Bot przez @BotFather, dodany jako admin kanału.
2. Darmowy endpoint Google Apps Script (obsługa ma już konto Google):
   przyjmuje `{ grupa: "slodkie" }` + prosty token, składa wiadomość
   (te same szablony), woła `sendMessage` Bot API, dopisuje wiersz
   (czas, grupa) do arkusza Google — wspólny dziennik zamiast localStorage.
3. store-order: przycisk = jeden `fetch` na endpoint.

Kontrakt endpointu do wdrożenia w store-order:

```
POST <apps-script-url>
Content-Type: application/json
{ "token": "<wspólny sekret>", "grupa": "slodkie" | "chleby" | "bulki" }
→ 200 { "ok": true }  (po wysłaniu posta i dopisaniu do arkusza)
```

## Co mierzyć po miesiącu

- liczba subskrybentów kanału (cel: pierwsze 100 z lady),
- wejścia w linki gazetki (parametr `utm_campaign=zaproszenie-<grupa>`),
- pytanie przy ladzie „skąd Pan/Pani wie?" w dni z zaproszeniem,
- dziennik: czy któreś okno się powtarza → decyzja produkcyjna.
