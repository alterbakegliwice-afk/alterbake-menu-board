'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const FRESH_STATE = {
  currentScreen: 'start',
  personal: { name: '', role: '', interviewer: '' },
  surveyAnswers: {},
  sjtAnswers:    {},
  openAnswers:   {},
  surveyIndex: 0,
  sjtIndex:    0,
  openIndex:   0,
};

let state = {};

function loadState() {
  try {
    const raw = localStorage.getItem('wpms_state_v1');
    state = raw ? JSON.parse(raw) : deepClone(FRESH_STATE);
  } catch {
    state = deepClone(FRESH_STATE);
  }
}

function saveState() {
  try { localStorage.setItem('wpms_state_v1', JSON.stringify(state)); } catch { /* ignore */ }
}

function resetState() {
  localStorage.removeItem('wpms_state_v1');
  state = deepClone(FRESH_STATE);
  showScreen('start');
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ─── Screen routing ───────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  state.currentScreen = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  saveState();
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
function init() {
  loadState();

  // Start screen
  document.getElementById('btn-start').addEventListener('click', () => showScreen('personal'));
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie dane i zacząć od nowa?')) resetState();
  });

  // Personal form
  document.getElementById('form-personal').addEventListener('submit', e => {
    e.preventDefault();
    state.personal = {
      name:        document.getElementById('input-name').value.trim(),
      role:        document.getElementById('input-role').value.trim(),
      interviewer: document.getElementById('input-interviewer').value.trim(),
    };
    state.surveyIndex = 0;
    saveState();
    showScreen('survey');
    renderSurvey();
  });

  // Survey
  document.getElementById('scale-buttons').addEventListener('click', e => {
    if (e.target.classList.contains('scale-btn')) selectScale(+e.target.dataset.value);
  });
  document.getElementById('survey-prev').addEventListener('click', surveyPrev);
  document.getElementById('survey-next').addEventListener('click', surveyNext);

  // SJT
  document.getElementById('sjt-prev').addEventListener('click', sjtPrev);
  document.getElementById('sjt-next').addEventListener('click', sjtNext);

  // Open
  document.getElementById('open-answer').addEventListener('input', () => {
    state.openAnswers[OPEN_QUESTIONS[state.openIndex].id] =
      document.getElementById('open-answer').value;
    saveState();
  });
  document.getElementById('open-prev').addEventListener('click', openPrev);
  document.getElementById('open-next').addEventListener('click', openNext);

  // Report
  document.getElementById('btn-print').addEventListener('click', () => window.print());
  document.getElementById('btn-copy').addEventListener('click', copyReport);
  document.getElementById('btn-restart').addEventListener('click', () => {
    if (confirm('Czy na pewno chcesz rozpocząć od nowa? Wszystkie dane zostaną usunięte.')) resetState();
  });

  // Restore session
  const s = state.currentScreen;
  if      (s === 'report')   { generateReport(); showScreen('report'); }
  else if (s === 'survey')   { restorePersonal(); showScreen('survey'); renderSurvey(); }
  else if (s === 'sjt')      { restorePersonal(); showScreen('sjt');    renderSjt(); }
  else if (s === 'open')     { restorePersonal(); showScreen('open');   renderOpen(); }
  else if (s === 'personal') { restorePersonal(); showScreen('personal'); }
  else                       { showScreen('start'); }
}

function restorePersonal() {
  document.getElementById('input-name').value        = state.personal.name        || '';
  document.getElementById('input-role').value        = state.personal.role        || '';
  document.getElementById('input-interviewer').value = state.personal.interviewer || '';
}

// ─── Survey ───────────────────────────────────────────────────────────────────
function renderSurvey() {
  const idx   = state.surveyIndex;
  const total = SURVEY_QUESTIONS.length;
  const q     = SURVEY_QUESTIONS[idx];
  const saved = state.surveyAnswers[q.id];

  pct('survey-progress', 10 + (idx / total) * 35);
  document.getElementById('survey-question-text').textContent = q.text;
  document.getElementById('survey-counter').textContent = (idx + 1) + ' / ' + total;
  document.getElementById('survey-prev').disabled = idx === 0;
  document.getElementById('survey-next').disabled = !saved;

  document.querySelectorAll('.scale-btn').forEach(btn => {
    btn.classList.toggle('selected', +btn.dataset.value === saved);
  });
}

function selectScale(value) {
  const q = SURVEY_QUESTIONS[state.surveyIndex];
  state.surveyAnswers[q.id] = value;
  saveState();
  document.querySelectorAll('.scale-btn').forEach(btn =>
    btn.classList.toggle('selected', +btn.dataset.value === value)
  );
  document.getElementById('survey-next').disabled = false;
  setTimeout(() => {
    if (state.surveyAnswers[q.id] === value) surveyNext();
  }, 380);
}

function surveyNext() {
  if (!state.surveyAnswers[SURVEY_QUESTIONS[state.surveyIndex].id]) return;
  if (state.surveyIndex < SURVEY_QUESTIONS.length - 1) {
    state.surveyIndex++;
    saveState();
    renderSurvey();
  } else {
    state.sjtIndex = 0;
    saveState();
    showScreen('sjt');
    renderSjt();
  }
}

function surveyPrev() {
  if (state.surveyIndex > 0) { state.surveyIndex--; saveState(); renderSurvey(); }
  else showScreen('personal');
}

// ─── SJT ──────────────────────────────────────────────────────────────────────
function renderSjt() {
  const idx   = state.sjtIndex;
  const total = SJT_QUESTIONS.length;
  const q     = SJT_QUESTIONS[idx];
  const saved = state.sjtAnswers[q.id];

  pct('sjt-progress', 45 + (idx / total) * 30);
  document.getElementById('sjt-scenario-text').textContent = q.scenario;
  document.getElementById('sjt-counter').textContent = (idx + 1) + ' / ' + total;
  document.getElementById('sjt-prev').disabled = idx === 0;
  document.getElementById('sjt-next').disabled = saved === undefined;

  const box = document.getElementById('sjt-options');
  box.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (saved === i ? ' selected' : '');
    btn.textContent = opt.text;
    btn.addEventListener('click', () => selectSjt(i));
    box.appendChild(btn);
  });
}

function selectSjt(index) {
  const q = SJT_QUESTIONS[state.sjtIndex];
  state.sjtAnswers[q.id] = index;
  saveState();
  document.querySelectorAll('.option-btn').forEach((btn, i) =>
    btn.classList.toggle('selected', i === index)
  );
  document.getElementById('sjt-next').disabled = false;
  setTimeout(() => {
    if (state.sjtAnswers[q.id] === index) sjtNext();
  }, 380);
}

function sjtNext() {
  if (state.sjtAnswers[SJT_QUESTIONS[state.sjtIndex].id] === undefined) return;
  if (state.sjtIndex < SJT_QUESTIONS.length - 1) {
    state.sjtIndex++;
    saveState();
    renderSjt();
  } else {
    state.openIndex = 0;
    saveState();
    showScreen('open');
    renderOpen();
  }
}

function sjtPrev() {
  if (state.sjtIndex > 0) { state.sjtIndex--; saveState(); renderSjt(); }
  else { showScreen('survey'); renderSurvey(); }
}

// ─── Open questions ───────────────────────────────────────────────────────────
function renderOpen() {
  const idx   = state.openIndex;
  const total = OPEN_QUESTIONS.length;
  const q     = OPEN_QUESTIONS[idx];

  pct('open-progress', 75 + (idx / total) * 20);
  document.getElementById('open-question-text').textContent = q.text;
  document.getElementById('open-counter').textContent = (idx + 1) + ' / ' + total;
  document.getElementById('open-answer').value = state.openAnswers[q.id] || '';
  document.getElementById('open-prev').disabled = idx === 0;
  document.getElementById('open-next').textContent =
    idx === total - 1 ? 'Zobacz raport →' : 'Dalej →';
}

function openNext() {
  const q = OPEN_QUESTIONS[state.openIndex];
  state.openAnswers[q.id] = document.getElementById('open-answer').value;
  saveState();
  if (state.openIndex < OPEN_QUESTIONS.length - 1) {
    state.openIndex++;
    renderOpen();
  } else {
    generateReport();
    showScreen('report');
  }
}

function openPrev() {
  const q = OPEN_QUESTIONS[state.openIndex];
  state.openAnswers[q.id] = document.getElementById('open-answer').value;
  saveState();
  if (state.openIndex > 0) { state.openIndex--; renderOpen(); }
  else { showScreen('sjt'); renderSjt(); }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
function calculateScores() {
  // Survey: average per category → normalize 1-5 to 0-100
  const surveySum   = {};
  const surveyCnt   = {};
  Object.keys(CATEGORIES).forEach(k => { surveySum[k] = 0; surveyCnt[k] = 0; });

  SURVEY_QUESTIONS.forEach(q => {
    const ans = state.surveyAnswers[q.id];
    if (ans !== undefined) { surveySum[q.category] += ans; surveyCnt[q.category]++; }
  });

  const surveyScores = {};
  Object.keys(CATEGORIES).forEach(k => {
    surveyScores[k] = surveyCnt[k] > 0
      ? ((surveySum[k] / surveyCnt[k]) - 1) / 4 * 100
      : 50;
  });

  // SJT: accumulate signed delta per category
  const sjtRaw = {};
  Object.keys(CATEGORIES).forEach(k => { sjtRaw[k] = 0; });

  SJT_QUESTIONS.forEach(q => {
    const sel = state.sjtAnswers[q.id];
    if (sel === undefined) return;
    Object.entries(q.options[sel].scores).forEach(([cat, val]) => {
      sjtRaw[cat] += val;
    });
  });

  // Normalize SJT to 0-100
  // Theoretical max positive per category ≈ 12 (6 questions × 2 pts)
  const SJT_RANGE = 12;
  const sjtScores = {};
  Object.keys(CATEGORIES).forEach(k => {
    sjtScores[k] = Math.max(0, Math.min(100,
      50 + (sjtRaw[k] / SJT_RANGE) * 50
    ));
  });

  // Combine 65% survey + 35% SJT
  const combined = {};
  Object.keys(CATEGORIES).forEach(k => {
    combined[k] = Math.round(surveyScores[k] * 0.65 + sjtScores[k] * 0.35);
  });

  return combined;
}

// ─── Collaboration style ──────────────────────────────────────────────────────
const COLLAB_STYLES = [
  {
    name: 'Solidny wykonawca',
    desc: 'Skupia się na rzetelnej realizacji zadań i dotrzymywaniu słowa. '
        + 'Silna strona to niezawodność i odpowiedzialność — sprawdza się '
        + 'w zadaniach wymagających precyzji, terminowości i konsekwencji.',
    key: s => (s.reliability + s.integrity) / 2,
  },
  {
    name: 'Proaktywny inicjator',
    desc: 'Naturalnie przejmuje inicjatywę i szuka usprawnień jeszcze przed '
        + 'pojawieniem się problemu. Silna strona to identyfikowanie luk i '
        + 'generowanie rozwiązań — sprawdza się tam, gdzie oczekuje się ruchu naprzód.',
    key: s => (s.initiative + s.problemSolving) / 2,
  },
  {
    name: 'Łącznik zespołu',
    desc: 'Priorytetem jest dobra współpraca i klarowna komunikacja. '
        + 'Buduje relacje i pomaga innym. Silna strona to tworzenie spójności '
        + 'grupowej — sprawdza się w roli koordynatora lub punktu kontaktu.',
    key: s => (s.collaboration + s.communication) / 2,
  },
  {
    name: 'Elastyczny adaptator',
    desc: 'Dobrze radzi sobie ze zmianami i presją. Szybko przyswaja nowe '
        + 'informacje i dostosowuje podejście. Silna strona to odporność i '
        + 'gotowość na nowe — sprawdza się w dynamicznych środowiskach.',
    key: s => (s.learning + s.pressure) / 2,
  },
];

function getCollabStyle(scores) {
  return COLLAB_STYLES.reduce((best, style) =>
    style.key(scores) > best.key(scores) ? style : best
  );
}

// ─── Descriptions ─────────────────────────────────────────────────────────────
const CAT_DESC = {
  reliability:    'Tendencja do dotrzymywania słowa, realizowania zobowiązań i bycia przewidywalnym partnerem.',
  pressure:       'Sposób funkcjonowania w sytuacjach trudnych, stresujących lub dynamicznie zmiennych.',
  collaboration:  'Podejście do pracy zespołowej, dzielenia się zasobami i aktywnego wspierania innych.',
  learning:       'Gotowość do przyswajania nowej wiedzy, wyciągania wniosków z błędów i zmiany sposobu działania.',
  initiative:     'Tendencja do działania bez czekania na instrukcje oraz do identyfikowania możliwości poprawy.',
  integrity:      'Podejście do uczciwości, brania odpowiedzialności i spójności między słowem a działaniem.',
  communication:  'Zdolność do jasnego przekazywania informacji, aktywnego słuchania i dopasowania stylu.',
  problemSolving: 'Podejście do identyfikowania przyczyn problemów i znajdowania skutecznych rozwiązań.',
};

const RISK_DESC = {
  reliability:    'Warto porozmawiać o doświadczeniach z dotrzymywaniem terminów i wywiązywaniem się z zobowiązań.',
  pressure:       'Warto zbadać, jak osoba radzi sobie w sytuacjach wymagających działania pod silną presją.',
  collaboration:  'Warto przyjrzeć się doświadczeniom ze współpracą grupową i rozwiązywaniem napięć w zespole.',
  learning:       'Warto zapytać o podejście do błędów i otwartość na zmianę dotychczasowych nawyków.',
  initiative:     'Warto sprawdzić oczekiwania co do poziomu samodzielności i gotowości do działania bez instrukcji.',
  integrity:      'Warto porozmawiać o sytuacjach, gdy trzeba było powiedzieć coś trudnego lub przyznać się do błędu.',
  communication:  'Warto przyjrzeć się stylowi komunikacji w różnych kontekstach — z przełożonym, zespołem, klientem.',
  problemSolving: 'Warto zbadać konkretne przykłady radzenia sobie z problemami operacyjnymi w praktyce.',
};

// ─── Report ───────────────────────────────────────────────────────────────────
function generateReport() {
  const scores = calculateScores();
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const top5   = sorted.slice(0, 5);
  const risks  = sorted.slice(-3).reverse();
  const style  = getCollabStyle(scores);

  // Meta
  const now = new Date();
  document.getElementById('report-date').textContent =
    now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  const parts = [];
  if (state.personal.name)        parts.push('Osoba: ' + state.personal.name);
  if (state.personal.role)        parts.push('Rola: '  + state.personal.role);
  if (state.personal.interviewer) parts.push('Rozmowę prowadzi: ' + state.personal.interviewer);
  document.getElementById('report-meta').textContent = parts.join(' · ');

  // Top 5 strengths
  const strengthsEl = document.getElementById('report-strengths');
  strengthsEl.innerHTML = '';
  top5.forEach(([cat, score], i) => {
    const card = el('div', 'strength-card');
    card.innerHTML =
      `<div class="strength-rank">${i + 1}</div>` +
      `<div class="strength-info">` +
        `<div class="strength-name">${CATEGORIES[cat]}</div>` +
        `<div class="strength-desc">${CAT_DESC[cat]}</div>` +
      `</div>` +
      `<div class="strength-bar-wrap"><div class="strength-bar" style="width:${score}%"></div></div>`;
    strengthsEl.appendChild(card);
  });

  // Risks
  const risksEl = document.getElementById('report-risks');
  risksEl.innerHTML = '';
  risks.forEach(([cat]) => {
    const card = el('div', 'risk-card');
    card.innerHTML =
      `<div class="risk-icon">!</div>` +
      `<div><div class="risk-name">${CATEGORIES[cat]}</div>` +
      `<div class="risk-desc">${RISK_DESC[cat]}</div></div>`;
    risksEl.appendChild(card);
  });

  // Collaboration style
  document.getElementById('report-style').innerHTML =
    `<div class="style-card">` +
      `<div class="style-name">${style.name}</div>` +
      `<div class="style-desc">${style.desc}</div>` +
    `</div>`;

  // Chart (all categories, sorted best→worst)
  const chartEl = document.getElementById('report-chart');
  chartEl.innerHTML = '';
  sorted.forEach(([cat, score]) => {
    const color = score >= 70 ? '#059669' : score >= 45 ? '#4f46e5' : '#f59e0b';
    const row   = el('div', 'chart-row');
    row.innerHTML =
      `<div class="chart-label">${CATEGORIES[cat]}</div>` +
      `<div class="chart-bar-wrap"><div class="chart-bar" style="width:${score}%;background:${color}"></div></div>` +
      `<div class="chart-value">${score}%</div>`;
    chartEl.appendChild(row);
  });

  // Recommendations
  const recs = buildRecs(scores, top5, risks, style);
  document.getElementById('report-recommendations').innerHTML =
    `<ul class="rec-list">${recs.map(r => `<li>${r}</li>`).join('')}</ul>`;

  // Deep dive questions
  const ddEl = document.getElementById('report-deepdive');
  ddEl.innerHTML = '';
  risks.forEach(([cat]) => appendDeepDive(ddEl, cat));
  appendDeepDive(ddEl, top5[0][0], '— pogłębienie mocnej strony', 1);

  // Open answers
  const openEl = document.getElementById('report-open-answers');
  openEl.innerHTML = '';
  OPEN_QUESTIONS.forEach(q => {
    const raw = state.openAnswers[q.id];
    const item = el('div', 'open-answer-item');
    item.innerHTML =
      `<div class="open-question">${escHtml(q.text)}</div>` +
      (raw && raw.trim()
        ? `<div class="open-response">${escHtml(raw)}</div>`
        : `<div class="open-response open-empty">(brak odpowiedzi)</div>`);
    openEl.appendChild(item);
  });
}

function appendDeepDive(container, cat, suffix = '', limit = 2) {
  const qs = (DEEP_DIVE_QUESTIONS[cat] || []).slice(0, limit);
  if (!qs.length) return;
  const div = el('div', 'deepdive-category');
  div.innerHTML =
    `<h4>${CATEGORIES[cat]}${suffix ? ' ' + suffix : ''}</h4>` +
    qs.map(q => `<div class="deepdive-question">${escHtml(q)}</div>`).join('');
  container.appendChild(div);
}

function buildRecs(scores, top5, risks, style) {
  const recs = [];
  recs.push(`Styl pracy wskazuje na profil „${style.name}" — warto potwierdzić go przez pytania o konkretne sytuacje z przeszłości.`);
  const topName = CATEGORIES[top5[0][0]].toLowerCase();
  recs.push(`Obszar ${topName} wydaje się wyraźną mocną stroną — sprawdź, jak ta osoba definiuje sukces i co sprawia jej satysfakcję w tej roli.`);
  risks.forEach(([cat]) => recs.push(RISK_DESC[cat]));
  if (scores.initiative < 50 && scores.reliability > 65)
    recs.push('Profil sugeruje osobę pewną w realizacji — warto ustalić, czy rola wymaga aktywnego wychodzenia z inicjatywą, czy raczej sumiennego wykonywania zdefiniowanych zadań.');
  if (scores.communication > 65 && scores.collaboration > 65)
    recs.push('Wysokie wyniki w komunikacji i współpracy sugerują osobę dobrze funkcjonującą w środowiskach wymagających koordynacji i pracy grupowej.');
  recs.push('Wyniki to punkt wyjścia do rozmowy, nie ocena. Traktuj je jako hipotezy do weryfikacji przez przykłady sytuacyjne i bezpośrednią obserwację.');
  return recs;
}

// ─── Copy report ──────────────────────────────────────────────────────────────
function copyReport() {
  const scores = calculateScores();
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const top5   = sorted.slice(0, 5);
  const risks  = sorted.slice(-3).reverse();
  const style  = getCollabStyle(scores);
  const line   = '─'.repeat(38);
  const lines  = [];

  lines.push('PROFIL PRACY I MOCNYCH STRON');
  lines.push('='.repeat(38));
  if (state.personal.name)        lines.push('Osoba: '            + state.personal.name);
  if (state.personal.role)        lines.push('Rola: '             + state.personal.role);
  if (state.personal.interviewer) lines.push('Rozmowę prowadzi: ' + state.personal.interviewer);
  lines.push('Data: ' + new Date().toLocaleDateString('pl-PL'));
  lines.push('');

  lines.push('TOP 5 MOCNYCH STRON');
  lines.push(line);
  top5.forEach(([cat, score], i) => {
    lines.push(`${i + 1}. ${CATEGORIES[cat]} (${score}%)`);
    lines.push('   ' + CAT_DESC[cat]);
  });
  lines.push('');

  lines.push('OBSZARY DO POGŁĘBIENIA');
  lines.push(line);
  risks.forEach(([cat, score]) => {
    lines.push(`• ${CATEGORIES[cat]} (${score}%)`);
    lines.push('  ' + RISK_DESC[cat]);
  });
  lines.push('');

  lines.push('STYL WSPÓŁPRACY');
  lines.push(line);
  lines.push(style.name);
  lines.push(style.desc);
  lines.push('');

  lines.push('PROFIL WSZYSTKICH KATEGORII');
  lines.push(line);
  sorted.forEach(([cat, score]) => lines.push(`${CATEGORIES[cat]}: ${score}%`));
  lines.push('');

  lines.push('PYTANIA POGŁĘBIAJĄCE');
  lines.push(line);
  risks.forEach(([cat]) => {
    lines.push(CATEGORIES[cat] + ':');
    (DEEP_DIVE_QUESTIONS[cat] || []).forEach(q => lines.push('  - ' + q));
  });
  lines.push('');

  lines.push('ODPOWIEDZI NA PYTANIA OTWARTE');
  lines.push(line);
  OPEN_QUESTIONS.forEach(q => {
    lines.push('Pytanie: ' + q.text);
    lines.push('Odpowiedź: ' + (state.openAnswers[q.id] || '(brak odpowiedzi)'));
    lines.push('');
  });

  lines.push('='.repeat(38));
  lines.push('Wygenerowano: ' + new Date().toLocaleDateString('pl-PL'));
  lines.push('Profil Pracy i Mocnych Stron — MVP · Narzędzie wewnętrzne');
  lines.push('Wyniki to punkt wyjścia do rozmowy, nie ocena ani diagnoza.');

  const text = lines.join('\n');
  const btn  = document.getElementById('btn-copy');

  const flashBtn = () => {
    const orig = btn.textContent;
    btn.textContent = '✓ Skopiowano!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(flashBtn).catch(() => fallbackCopy(text, flashBtn));
  } else {
    fallbackCopy(text, flashBtn);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch { /* ignore */ }
  document.body.removeChild(ta);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pct(id, value) {
  document.getElementById(id).style.width = Math.min(100, value) + '%';
}

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
