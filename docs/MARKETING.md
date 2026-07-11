# AlterBake — jak wykorzystać potencjał tego projektu

Tablica menu to dziś jeden ekran w lokalu. Te same treści (produkty, ceny, „wypiek dnia") mogą pracować w kilku kanałach naraz — bez zmiany filozofii projektu (czysty HTML/CSS, zero zależności, zero usług zewnętrznych).

## Co już jest w repozytorium

| Materiał | Plik | Format |
|---|---|---|
| Tablica menu (kiosk iPad) | `index.html` | ekran |
| Cennik do druku | ta sama tablica → Drukuj | A4 (automatyczny układ przez `@media print`) |
| Ulotka / cennik na ladę | `materials/ulotka-a4.html` | A4 z sekcją „Dlaczego my" |
| Instagram Story | `materials/social-story.html` | 1080×1920 |
| Instagram / Facebook post | `materials/social-post.html` | 1080×1080 |
| Plakat na witrynę / sztalugę | `materials/plakat-witryna.html` | A4 z kodem QR |

Gotowe PNG generuje jedno polecenie: `npm run materials` → pliki w `materials/out/`.
Bez Node'a: otwórz szablon w przeglądarce i zrób zrzut ekranu.

## Codzienny rytm (5 minut rano)

1. Zmień „wypiek dnia" i ceny w `products.json` i `index.html` (testy pilnują spójności).
2. Uruchom `npm run materials` — masz świeżą grafikę Story z dzisiejszym wypiekiem.
3. Wrzuć Story na @alterbake przed 8:00 — komunikat „świeże od 8:00" działa najlepiej, gdy pojawia się zanim ludzie wyjdą z domu.
4. Gdy coś się wyprzeda — ustaw `soldOut: true` na tablicy i opcjonalnie wrzuć Story „WYPRZEDANE" (to buduje przekaz: znika, bo świeże).

## Most offline → online (wdrożone)

- **Kod QR** (`materials/qr-instagram.svg`) prowadzi na @alterbake; jest w stopce ulotki i na plakacie witrynowym. Klient przy ladzie i przechodzień przy szybie mają jedną, natychmiastową drogę do obserwowania piekarni.
- **Plakat witrynowy** — duża typografia czytelna z ulicy: wypiek dnia, trzy polecane, QR. Wydrukuj, wymieniaj przy zmianie wypieku dnia.
- **Menu online** — push do `main` publikuje tablicę na GitHub Pages (workflow `pages.yml`; włącz raz: Settings → Pages → Source: GitHub Actions). Link wklej w bio na Instagramie i w wizytówce Google. Tablica ma dane strukturalne schema.org (typ Bakery), więc Google rozumie, że to piekarnia w Gliwicach.

## Pomysły na następne kroki (od najprostszych)

1. **Wizytówka Google (Google Business Profile)** — największy darmowy kanał dla lokalnej piekarni. Zdjęcia z `materials/out/` można wrzucać jako aktualności; godziny i link do menu online z tego repo.
2. **Sezonowe warianty kolorystyczne** — cała paleta siedzi w zmiennych CSS w `:root`; świąteczna/wielkanocna wersja tablicy to zmiana kilku kolorów.
3. **Druga tablica: „ekran przy wejściu"** — wariant z samym „wypiekiem dnia" i 3 polecanymi, duża typografia, widoczny z ulicy przez szybę.
4. **Tablica wieczorna** — po 16:00 komunikat „ostatnie sztuki −20%" zamiast „świeże od 8:00"; przeciwdziała stratom i buduje ruch popołudniowy.
5. **Archiwum cen** — historia zmian w git to darmowa dokumentacja cen; przydatne przy analizie marż.

## Zasady spójności marki

- Styl "bakery bold editorial": czarny tusz `#1d1b18` na ciepłym papierze `#f6f4ee`, akcent szampański `#c9a86a`, ciepła szarość `#6f6a61`. Ramki zamiast cieni, płaskie karty.
- Tablica: logotyp ALTERBAKE w Antonie (wysoki, wąski grotesk), nagłówki kategorii w Archivo Black, reszta czcionką systemową. Materiały drukowane: Fraunces (szeryf displayowy). Wszystkie fonty lokalnie w `fonts/`, licencje SIL OFL.
- Ceny zawsze w formacie `12 zł` + jednostka `/ porcja`.
- Kluczowe hasła: „stara piekarnia na nowo", „od ponad 100 lat", „świeże od 8:00".
