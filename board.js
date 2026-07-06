/*
  Tryb obslugi tablicy AlterBake - statusy dostepnosci w ciagu dnia.

  Jak uzywac (na iPadzie przy ladzie):
  1. Stuknij 5 razy szybko w logo "AlterBake" - wlaczy sie tryb edycji.
  2. Stukaj w produkt, zeby przelaczac stan:
     dostepne -> OSTATNIE SZTUKI -> WYPRZEDANE -> dostepne.
  3. Stuknij "Zakoncz" na dolnym pasku (albo odczekaj 45 s) - tryb sie wylaczy.

  Zapis w localStorage tego iPada, dziala offline, bez zadnego serwera.
  Statusy kasuja sie same nastepnego dnia (rano tablica startuje od stanu
  z index.html). Produkty bez ceny w HTML (wyprzedane od rana) nie sa
  przelaczalne - wracaja na lade przez edycje products.json i index.html.

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

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      // Nowy dzien = swieze pieczywo: wczorajsze statusy nie obowiazuja.
      if (!data || data.day !== todayKey()) return {};
      return data.items || {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(items) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ day: todayKey(), items: items }));
    } catch (e) { /* np. tryb prywatny Safari - trudno, dziala do odswiezenia */ }
  }

  function nameOf(item) {
    var h3 = item.querySelector("h3");
    if (!h3 || !h3.firstChild) return "";
    // Pierwszy wezel tekstowy = nazwa produktu (plakietka jest w <span> dalej).
    return (h3.firstChild.textContent || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  }

  function hasPrice(item) {
    var strong = item.querySelector(".item-price strong");
    return !!(strong && strong.textContent.replace(/\s/g, "") !== "");
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

  function render(item, state) {
    item.classList.remove("sold-out", "js-soldout", "stock-low");
    if (state === "wyprzedane") {
      item.classList.add("sold-out", "js-soldout");
      setBadge(item, OUT_TEXT, false);
    } else if (state === "ostatnie") {
      item.classList.add("stock-low");
      setBadge(item, LOW_TEXT, true);
    } else {
      setBadge(item, "", false);
    }
  }

  var saved = loadSaved();
  var menuItems = [];
  var all = document.querySelectorAll(".menu-item");
  for (var i = 0; i < all.length; i++) menuItems.push(all[i]);

  // Zastosuj zapisane statusy z tego dnia.
  for (var j = 0; j < menuItems.length; j++) {
    var n = nameOf(menuItems[j]);
    if (n && saved[n] && hasPrice(menuItems[j])) render(menuItems[j], saved[n]);
  }

  // --- Tryb edycji ---

  var editMode = false;
  var tapCount = 0;
  var tapTimer = null;
  var idleTimer = null;

  var banner = document.createElement("div");
  banner.className = "edit-banner";
  banner.innerHTML =
    '<span>TRYB EDYCJI &middot; stukaj w produkty: dostępne → ostatnie sztuki → wyprzedane</span>' +
    '<button type="button">Zakończ</button>';
  banner.style.display = "none";
  document.body.appendChild(banner);
  banner.querySelector("button").addEventListener("click", function () { setEditMode(false); });

  function setEditMode(on) {
    editMode = on;
    document.body.className = document.body.className.replace(/\s*edit-mode/g, "");
    if (on) document.body.className += " edit-mode";
    banner.style.display = on ? "" : "none";
    bumpIdle();
  }

  function bumpIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    if (editMode) idleTimer = setTimeout(function () { setEditMode(false); }, IDLE_EXIT_MS);
  }

  var logo = document.querySelector("h1");
  if (logo) {
    logo.addEventListener("click", function () {
      tapCount++;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapCount = 0; }, TAP_WINDOW_MS);
      if (tapCount >= TAPS_TO_ENTER) {
        tapCount = 0;
        setEditMode(!editMode);
      }
    });
  }

  for (var k = 0; k < menuItems.length; k++) {
    (function (item) {
      item.addEventListener("click", function () {
        if (!editMode) return;
        bumpIdle();
        if (!hasPrice(item)) return; // wyprzedane od rana - edycja przez pliki
        var idx = STATES.indexOf(currentState(item));
        var next = STATES[(idx + 1) % STATES.length];
        render(item, next);
        var n = nameOf(item);
        if (n) {
          var items = loadSaved();
          items[n] = next;
          saveAll(items);
        }
      });
    })(menuItems[k]);
  }
})();
