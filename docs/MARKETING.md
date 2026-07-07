# AlterBake — jak wykorzystać potencjał tego projektu

Tablica menu to dziś jeden ekran w lokalu. Te same treści (produkty, ceny, „wypiek dnia") mogą pracować w kilku kanałach naraz — bez zmiany filozofii projektu (czysty HTML/CSS, zero zależności, zero usług zewnętrznych).

## Co już jest w repozytorium

| Materiał | Plik | Format |
|---|---|---|
| Tablica menu (kiosk iPad) | `alterbake-menu/index.html` | ekran |
| Cennik do druku | ta sama tablica → Drukuj | A4 (automatyczny układ przez `@media print`) |
| Ulotka / cennik na ladę | `materials/ulotka-a4.html` | A4 z sekcją „Dlaczego my" |
| Instagram Story | `materials/social-story.html` | 1080×1920 |
| Instagram / Facebook post | `materials/social-post.html` | 1080×1080 |

Gotowe PNG generuje jedno polecenie: `npm run materials` → pliki w `materials/out/`.
Bez Node'a: otwórz szablon w przeglądarce i zrób zrzut ekranu.

## Codzienny rytm (5 minut rano)

1. Zmień „wypiek dnia" i ceny w `products.json` i `index.html` (testy pilnują spójności).
2. Uruchom `npm run materials` — masz świeżą grafikę Story z dzisiejszym wypiekiem.
3. Wrzuć Story na @alterbake.gliwice przed 8:00 — komunikat „świeże od 8:00" działa najlepiej, gdy pojawia się zanim ludzie wyjdą z domu.
4. Gdy coś się wyprzeda — ustaw `soldOut: true` na tablicy i opcjonalnie wrzuć Story „WYPRZEDANE" (to buduje przekaz: znika, bo świeże).

## Pomysły na następne kroki (od najprostszych)

1. **Wizytówka Google (Google Business Profile)** — największy darmowy kanał dla lokalnej piekarni. Zdjęcia z `materials/out/` można wrzucać jako aktualności; godziny i menu z tego repo.
2. **Kod QR na ulotce i wystawie** — prowadzący do Instagrama albo strony z menu. Ulotka ma już miejsce w stopce.
3. **Wersja menu online** — ten sam `index.html` wrzucony na darmowy hosting statyczny (GitHub Pages działa z tym repo od ręki) = menu do linkowania w bio na Instagramie.
4. **Sezonowe warianty kolorystyczne** — cała paleta siedzi w zmiennych CSS w `:root`; świąteczna/wielkanocna wersja tablicy to zmiana kilku kolorów.
5. **Druga tablica: „ekran przy wejściu"** — wariant z samym „wypiekiem dnia" i 3 polecanymi, duża typografia, widoczny z ulicy przez szybę.
6. **Tablica wieczorna** — po 16:00 komunikat „ostatnie sztuki −20%" zamiast „świeże od 8:00"; przeciwdziała stratom i buduje ruch popołudniowy.
7. **Archiwum cen** — historia zmian w git to darmowa dokumentacja cen; przydatne przy analizie marż.

## Zasady spójności marki

- Paleta premium-minimal: kość słoniowa `#faf9f6`, grafit espresso `#1d1b18`, szampan `#c9a86a`, brąz `#77603a`, ciepła szarość `#6f6a61`. Ciemne panele: gradient `#2b2721 → #191612`.
- Nagłówki: Georgia (szeryfowa), tekst: czcionka systemowa.
- Ceny zawsze w formacie `12 zł` + jednostka `/ porcja`.
- Kluczowe hasła: „stara piekarnia na nowo", „od ponad 100 lat", „świeże od 8:00".
