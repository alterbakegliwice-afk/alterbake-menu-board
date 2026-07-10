/*
  Tryb obslugi tablicy AlterBake - szybkie zmiany w ciagu dnia, bez plikow.

  Jak uzywac (na iPadzie przy ladzie):
  1. Stuknij 5 razy szybko w logo "AlterBake" i podaj PIN obslugi
     (domyslnie 1234 - ZMIEN go w stalej PIN_CODE ponizej).
  2. W trybie edycji:
     - stukniecie w produkt przelacza stan:
       dostepne -> OSTATNIE SZTUKI -> WYPRZEDANE -> dostepne,
     - przytrzymanie produktu (pol sekundy) przelacza zlote wyroznienie,
     - stukniecie w panel "WYPIEK DNIA" podmienia wypiek na kolejny
       dostepny produkt z kolumn (i wraca do oryginalu na koncu cyklu),
     - przycisk "Wieczor" na dolnym pasku wlacza komunikat koncowki dnia
       ("ostatnie wypieki" zamiast "swieze od 8:00").
  3. Stuknij "Zakoncz" (albo odczekaj 45 s) - tryb sie wylaczy.

  Zapis w localStorage tego iPada, dziala offline, bez zadnego serwera.
  Wszystkie zmiany kasuja sie same nastepnego dnia - rano tablica startuje
  od stanu z index.html (swiezy wypiek). Produkty bez ceny w HTML
  (wyprzedane od rana) nie sa przelaczalne - wracaja przez edycje plikow.

  Bez tego pliku tablica dziala normalnie jako czysty statyczny HTML.
*/
(function () {
  "use strict";

  var STORE_KEY = "alterbake-stock-v1";
  var LOW_TEXT = "OSTATNIE SZTUKI";
  var OUT_TEXT = "WYPRZEDANE";
  var STATES = ["dostepne", "ostatnie", "wyprzedane"];
  var IDLE_EXIT_MS = 45000;
  var TAP_WINDOW_MS = 700;
  var TAPS_TO_ENTER = 5;
  var LONG_PRESS_MS = 500;

  /* PIN obslugi - zmien przed uzyciem w sklepie. Chroni tryb edycji przed
     przypadkowym (i celowym) stukaniem klientow. */
  var PIN_CODE = "1234";
  var PIN_TIMEOUT_MS = 30000;
  var PIN_MAX_TRIES = 5;
  var PIN_LOCK_MS = 60000;

  /* Teksty trybu wieczornego - zmien tutaj, jesli chcesz inny komunikat. */
  var EVENING_KICKER = "KOŃCÓWKA DNIA";
  var EVENING_TODAY = "ostatnie wypieki";

  // --- Zapis stanu dnia ---

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function loadState() {
    var empty = { items: {}, highlights: {}, feature: null, evening: false };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return empty;
      var data = JSON.parse(raw);
      // Nowy dzien = swiezy wypiek: wczorajsze zmiany nie obowiazuja.
      if (!data || data.day !== todayKey()) return empty;
      return {
        items: data.items || {},
        highlights: data.highlights || {},
        feature: data.feature || null,
        evening: !!data.evening,
      };
    } catch (e) {
      return empty;
    }
  }

  var state = loadState();

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        day: todayKey(),
        items: state.items,
        highlights: state.highlights,
        feature: state.feature,
        evening: state.evening,
      }));
    } catch (e) { /* np. tryb prywatny Safari - dziala do odswiezenia */ }
  }

  // --- Pozycje menu ---

  function nameOf(item) {
    var h3 = item.querySelector("h3");
    if (!h3 || !h3.firstChild) return "";
    // Pierwszy wezel tekstowy = nazwa produktu (plakietka jest w <span> dalej).
    // Usuwamy miekkie dzielniki (&shy;), zeby klucze w localStorage i
    // porownania nazw byly niezalezne od typografii w HTML.
    return (h3.firstChild.textContent || "")
      .replace(/\u00AD/g, "")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function descOf(item) {
    var p = item.querySelector(".item-desc");
    return p ? p.textContent.replace(/^\s+|\s+$/g, "") : "";
  }

  function priceOf(item) {
    var strong = item.querySelector(".item-price strong");
    var span = item.querySelector(".item-price span");
    return {
      amount: strong ? strong.textContent.replace(/^\s+|\s+$/g, "") : "",
      unit: span ? span.textContent.replace(/^\s+|\s+$/g, "") : "",
    };
  }

  function hasPrice(item) {
    return priceOf(item).amount !== "";
  }

  function currentState(item) {
    if (item.className.indexOf("sold-out") !== -1) return "wyprzedane";
    if (item.className.indexOf("stock-low") !== -1) return "ostatnie";
    return "dostepne";
  }

  function setBadge(item, text, low) {
    var h3 = item.querySelector("h3");
    var old = h3.querySelector(".status-badge");
    if (old) h3.removeChild(old);
    if (!text) return;
    var span = document.createElement("span");
    span.className = "status-badge" + (low ? " low" : "");
    span.textContent = text;
    h3.appendChild(document.createTextNode(" "));
    h3.appendChild(span);
  }

  function render(item, st) {
    item.classList.remove("sold-out", "js-soldout", "stock-low");
    if (st === "wyprzedane") {
      item.classList.add("sold-out", "js-soldout");
      setBadge(item, OUT_TEXT, false);
    } else if (st === "ostatnie") {
      item.classList.add("stock-low");
      setBadge(item, LOW_TEXT, true);
    } else {
      setBadge(item, "", false);
    }
  }

  var menuItems = [];
  var all = document.querySelectorAll(".menu-item");
  for (var i = 0; i < all.length; i++) menuItems.push(all[i]);

  function itemByName(name) {
    for (var j = 0; j < menuItems.length; j++) {
      if (nameOf(menuItems[j]) === name) return menuItems[j];
    }
    return null;
  }

  // --- Wyroznienie (zloty pasek) ---

  function applyHighlight(item, on) {
    if (on) item.classList.add("highlight");
    else item.classList.remove("highlight");
  }

  function toggleHighlight(item) {
    var n = nameOf(item);
    if (!n) return;
    var on = item.className.indexOf("highlight") === -1;
    applyHighlight(item, on);
    state.highlights[n] = on;
    persist();
  }

  // --- Wypiek dnia ---

  var feature = document.querySelector(".feature");
  var featureBase = null;
  if (feature) {
    featureBase = {
      title: feature.querySelector("h2") ? feature.querySelector("h2").textContent : "",
      desc: feature.querySelector(".feature-copy p:not(.section-kicker)")
        ? feature.querySelector(".feature-copy p:not(.section-kicker)").textContent : "",
      amount: feature.querySelector(".feature-price strong")
        ? feature.querySelector(".feature-price strong").textContent : "",
      unit: feature.querySelector(".feature-price span")
        ? feature.querySelector(".feature-price span").textContent : "",
    };
  }

  function setFeatureContent(title, desc, amount, unit) {
    if (!feature) return;
    var h2 = feature.querySelector("h2");
    var p = feature.querySelector(".feature-copy p:not(.section-kicker)");
    var strong = feature.querySelector(".feature-price strong");
    var span = feature.querySelector(".feature-price span");
    if (h2) h2.textContent = title;
    if (p) p.textContent = desc;
    if (strong) strong.textContent = amount;
    if (span) span.textContent = unit;
  }

  function applyFeature(name) {
    if (!feature || !featureBase) return false;
    if (!name) {
      setFeatureContent(featureBase.title, featureBase.desc, featureBase.amount, featureBase.unit);
      return true;
    }
    var item = itemByName(name);
    if (!item || !hasPrice(item) || currentState(item) === "wyprzedane") return false;
    var price = priceOf(item);
    setFeatureContent(name, descOf(item), price.amount, price.unit);
    return true;
  }

  function eligibleFeatureNames() {
    var names = [];
    for (var j = 0; j < menuItems.length; j++) {
      var it = menuItems[j];
      if (hasPrice(it) && currentState(it) !== "wyprzedane") {
        var n = nameOf(it);
        if (n && names.indexOf(n) === -1) names.push(n);
      }
    }
    return names;
  }

  function cycleFeature() {
    var names = eligibleFeatureNames();
    // Cykl: oryginal -> produkt 1 -> produkt 2 -> ... -> oryginal.
    var order = [null].concat(names);
    var idx = state.feature ? order.indexOf(state.feature) : 0;
    var next = order[(idx + 1) % order.length];
    if (applyFeature(next)) {
      state.feature = next;
      persist();
    }
  }

  // --- Tryb wieczorny ---

  var todayBox = document.querySelector(".masthead .today");
  var todayBase = null;
  if (todayBox) {
    todayBase = {
      kicker: todayBox.querySelector("span") ? todayBox.querySelector("span").textContent : "",
      line: todayBox.querySelector("strong") ? todayBox.querySelector("strong").textContent : "",
    };
  }

  function applyEvening(on) {
    if (!todayBox || !todayBase) return;
    var span = todayBox.querySelector("span");
    var strong = todayBox.querySelector("strong");
    if (span) span.textContent = on ? EVENING_KICKER : todayBase.kicker;
    if (strong) strong.textContent = on ? EVENING_TODAY : todayBase.line;
    if (on) document.body.classList.add("evening");
    else document.body.classList.remove("evening");
    if (eveningBtn) eveningBtn.textContent = on ? "Dzień" : "Wieczór";
  }

  // --- Zastosuj zapisany stan dnia ---

  for (var j2 = 0; j2 < menuItems.length; j2++) {
    var n2 = nameOf(menuItems[j2]);
    if (!n2) continue;
    if (state.items[n2] && hasPrice(menuItems[j2])) render(menuItems[j2], state.items[n2]);
    if (typeof state.highlights[n2] === "boolean") applyHighlight(menuItems[j2], state.highlights[n2]);
  }
  if (state.feature && !applyFeature(state.feature)) {
    // Zapisany wypiek dnia jest juz niedostepny - wroc do oryginalu.
    state.feature = null;
    applyFeature(null);
    persist();
  }

  // Kiosk dziala tygodniami bez przeladowania - dobowy reset musi zadzialac
  // takze wtedy. Po zmianie daty tablica przeladowuje sie sama (poza trybem
  // edycji), startujac od swiezego stanu z index.html.
  var startDay = todayKey();
  setInterval(function () {
    if (todayKey() !== startDay && !editMode) location.reload();
  }, 60000);

  // --- Tryb edycji ---

  var editMode = false;
  var tapCount = 0;
  var tapTimer = null;
  var idleTimer = null;

  var banner = document.createElement("div");
  banner.className = "edit-banner";
  banner.innerHTML =
    '<span>TRYB EDYCJI &middot; stuknij: status &middot; przytrzymaj: wyróżnienie &middot; wypiek dnia: stuknij panel</span>' +
    '<span class="edit-actions">' +
    '<button type="button" class="btn-evening">Wieczór</button>' +
    '<button type="button" class="btn-exit">Zakończ</button>' +
    '</span>';
  banner.style.display = "none";
  document.body.appendChild(banner);
  var eveningBtn = banner.querySelector(".btn-evening");
  banner.querySelector(".btn-exit").addEventListener("click", function () { setEditMode(false); });
  eveningBtn.addEventListener("click", function () {
    state.evening = !state.evening;
    applyEvening(state.evening);
    persist();
    bumpIdle();
  });

  applyEvening(state.evening);

  function setEditMode(on) {
    editMode = on;
    if (on) document.body.classList.add("edit-mode");
    else document.body.classList.remove("edit-mode");
    banner.style.display = on ? "" : "none";
    bumpIdle();
  }

  function bumpIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    if (editMode) idleTimer = setTimeout(function () { setEditMode(false); }, IDLE_EXIT_MS);
  }

  // --- Klawiatura PIN ---

  var pinOverlay = document.createElement("div");
  pinOverlay.className = "pin-overlay";
  pinOverlay.innerHTML =
    '<div class="pin-box">' +
    '<p class="pin-title">PIN obsługi</p>' +
    '<p class="pin-dots"></p>' +
    '<div class="pin-pad"></div>' +
    '<button type="button" class="pin-cancel">Anuluj</button>' +
    '</div>';
  pinOverlay.style.display = "none";
  document.body.appendChild(pinOverlay);

  var pinEntered = "";
  var pinDots = pinOverlay.querySelector(".pin-dots");
  var pinTitle = pinOverlay.querySelector(".pin-title");
  var pinPad = pinOverlay.querySelector(".pin-pad");
  var pinTimer = null;
  var pinTries = 0;
  var pinLockedUntil = 0;
  var digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  for (var d = 0; d < digits.length; d++) {
    (function (digit) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = digit;
      b.addEventListener("click", function () { pinPress(digit); });
      pinPad.appendChild(b);
    })(digits[d]);
  }
  pinOverlay.querySelector(".pin-cancel").addEventListener("click", closePin);

  function renderDots() {
    var out = "";
    for (var x = 0; x < 4; x++) out += x < pinEntered.length ? "\u25CF" : "\u25CB";
    pinDots.textContent = out;
  }

  function openPin() {
    pinEntered = "";
    pinTitle.textContent = "PIN obsługi";
    renderDots();
    pinOverlay.style.display = "";
    if (pinTimer) clearTimeout(pinTimer);
    pinTimer = setTimeout(closePin, PIN_TIMEOUT_MS);
  }

  function closePin() {
    pinOverlay.style.display = "none";
    pinEntered = "";
    if (pinTimer) clearTimeout(pinTimer);
  }

  function pinPress(digit) {
    // Blokada po serii blednych prob - koniec z cierpliwym zgadywaniem.
    if (Date.now() < pinLockedUntil) {
      pinTitle.textContent = "Za dużo prób – poczekaj minutę";
      return;
    }
    if (pinTimer) clearTimeout(pinTimer);
    pinTimer = setTimeout(closePin, PIN_TIMEOUT_MS);
    pinEntered += digit;
    renderDots();
    if (pinEntered.length < 4) return;
    if (pinEntered === PIN_CODE) {
      pinTries = 0;
      closePin();
      setEditMode(true);
    } else {
      pinEntered = "";
      renderDots();
      pinTries++;
      if (pinTries >= PIN_MAX_TRIES) {
        pinTries = 0;
        pinLockedUntil = Date.now() + PIN_LOCK_MS;
        pinTitle.textContent = "Za dużo prób – poczekaj minutę";
      } else {
        pinTitle.textContent = "Błędny PIN";
      }
    }
  }

  var logo = document.querySelector("h1");
  if (logo) {
    logo.addEventListener("click", function () {
      tapCount++;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapCount = 0; }, TAP_WINDOW_MS);
      if (tapCount >= TAPS_TO_ENTER) {
        tapCount = 0;
        if (editMode) setEditMode(false);
        else openPin();
      }
    });
  }

  if (feature) {
    feature.addEventListener("click", function () {
      if (!editMode) return;
      bumpIdle();
      cycleFeature();
    });
  }

  // Stukniecie = status, przytrzymanie = wyroznienie.
  for (var k = 0; k < menuItems.length; k++) {
    (function (item) {
      var pressTimer = null;
      var longPressFired = false;

      function startPress() {
        if (!editMode) return;
        clearPress();
        pressTimer = setTimeout(function () {
          longPressFired = true;
          toggleHighlight(item);
          bumpIdle();
        }, LONG_PRESS_MS);
      }

      function clearPress() {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      }

      item.addEventListener("touchstart", startPress);
      item.addEventListener("mousedown", startPress);
      item.addEventListener("touchmove", clearPress);
      item.addEventListener("touchend", clearPress);
      item.addEventListener("mouseup", clearPress);
      item.addEventListener("mouseleave", clearPress);

      item.addEventListener("click", function () {
        if (!editMode) return;
        if (longPressFired) { longPressFired = false; return; }
        bumpIdle();
        if (!hasPrice(item)) return; // wyprzedane od rana - edycja przez pliki
        var idx = STATES.indexOf(currentState(item));
        var next = STATES[(idx + 1) % STATES.length];
        render(item, next);
        var n = nameOf(item);
        if (n) {
          state.items[n] = next;
          // Wyprzedany produkt nie moze byc wypiekiem dnia.
          if (next === "wyprzedane" && state.feature === n) {
            state.feature = null;
            applyFeature(null);
          }
          persist();
        }
      });
    })(menuItems[k]);
  }
})();
