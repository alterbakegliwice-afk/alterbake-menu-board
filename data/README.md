# Dane źródłowe – cennik z formularza zamówień

Ten katalog zawiera **wierny cennik pieczywa i wypieków** wyeksportowany z
formularza zamówień Alterbake (pojedyncze źródło produktów). Służy jako
źródło nazw i cen dla tablicy menu — **nie jest** bezpośrednio wyświetlany
i nie wpływa na `products.json` ani na testy CI.

## Pliki

- `cennik-formularz.json` – pełny katalog (58 pozycji) ze strukturą.
- `cennik-formularz.csv` – ta sama treść w arkuszu (import do Excela/Sheets).

## Pola

| Pole | Znaczenie |
|---|---|
| `name` | Nazwa produktu (czysta, bez ceny) |
| `price` | Cena liczbowo (np. `14`, `19.5`) |
| `priceText` | Cena w formacie tablicy, np. `14 zł`, `19,50 zł` |
| `unit` | Jednostka, np. `szt.`, `kg`, `0,5 kg`, `100 g` |
| `unitText` | Jednostka w formacie tablicy, np. `/ szt.`, `/ kg` |
| `priceLabel` | Cena z jednostką, np. `14,00 zł / szt.` |
| `category` | `chleby` \| `drobne` \| `slodkie` \| `ciasta` |
| `categoryLabel` | Czytelna nazwa sekcji |
| `availability` | Dni wypieku, np. `tylko czwartek`, `pon i śr` (puste = codziennie) |
| `popular` | `true` dla najczęściej kupowanych (kandydaci do „polecane") |

## Jak wykorzystać w tablicy (`products.json`)

`priceText` i `unitText` są już w formacie pól `price` i `unit` tablicy.
Sugerowane mapowanie kategorii na sekcje tablicy
(`polecane`, `słodkie`, `chleby`, `na-wagę`):

- `chleby` → **chleby**
- `slodkie` → **słodkie**
- `drobne` (bułki, kajzerki, bagietki) → **chleby** lub osobna sekcja
- `ciasta` sprzedawane na wagę (kg / 0,5 kg / 100 g) → **na-wagę**
- `popular: true` → dobrzy kandydaci do **polecane**

Wyboru konkretnych pozycji na jeden ekran iPada dokonuje się ręcznie w
`products.json` i `index.html` (tablica jest celowo statyczna i dobrana pod
jeden ekran).

## Odświeżenie

Plik generowany jest z katalogu `PRODUCT_CATALOG` w repozytorium
`alterbake-orders` (`Code.gs`). Przy zmianie cen w formularzu wyeksportuj
ponownie i podmień te pliki.
