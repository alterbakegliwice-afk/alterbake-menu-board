const CATEGORIES = {
  reliability:    'Niezawodność',
  pressure:       'Stabilność pod presją',
  collaboration:  'Współpraca',
  learning:       'Uczenie się',
  initiative:     'Inicjatywa',
  integrity:      'Uczciwość i odpowiedzialność',
  communication:  'Komunikacja',
  problemSolving: 'Praktyczne rozwiązywanie problemów',
};

const SURVEY_QUESTIONS = [
  // Niezawodność
  { id: 's1', category: 'reliability',    text: 'Dotrzymuję terminów, nawet gdy napotykam trudności po drodze.' },
  { id: 's2', category: 'reliability',    text: 'Inni mogą na mnie polegać w trudnych momentach.' },
  { id: 's3', category: 'reliability',    text: 'Gdy obiecuję coś zrobić, konsekwentnie to realizuję.' },

  // Stabilność pod presją
  { id: 's4', category: 'pressure',       text: 'W sytuacjach stresujących zachowuję spokój i skupienie.' },
  { id: 's5', category: 'pressure',       text: 'Gdy coś idzie nie po planie, szybko się adaptuję.' },
  { id: 's6', category: 'pressure',       text: 'Presja czasowa mobilizuje mnie zamiast mnie blokować.' },

  // Współpraca
  { id: 's7', category: 'collaboration',  text: 'Chętnie dzielę się wiedzą i pomagam innym w zespole.' },
  { id: 's8', category: 'collaboration',  text: 'Słucham opinii innych, nawet gdy się z nimi nie zgadzam.' },
  { id: 's9', category: 'collaboration',  text: 'Aktywnie angażuję się we wspólne osiąganie celów.' },

  // Uczenie się
  { id: 's10', category: 'learning',      text: 'Szukam nowych sposobów wykonywania swojej pracy.' },
  { id: 's11', category: 'learning',      text: 'Potrafię przyznać się do błędu i wyciągam z niego wnioski.' },
  { id: 's12', category: 'learning',      text: 'Aktywnie poszukuję nowych umiejętności i wiedzy.' },

  // Inicjatywa
  { id: 's13', category: 'initiative',    text: 'Zauważam problemy i działam, zanim ktoś mnie o to poprosi.' },
  { id: 's14', category: 'initiative',    text: 'Proponuję nowe rozwiązania i ulepszenia w pracy.' },
  { id: 's15', category: 'initiative',    text: 'Biorę odpowiedzialność za wyniki, nie czekam na gotowe instrukcje.' },

  // Uczciwość i odpowiedzialność
  { id: 's16', category: 'integrity',     text: 'Mówię wprost, nawet gdy to trudne lub niewygodne.' },
  { id: 's17', category: 'integrity',     text: 'Przyznaję się do błędów i biorę za nie odpowiedzialność.' },
  { id: 's18', category: 'integrity',     text: 'Traktuję innych sprawiedliwie, niezależnie od okoliczności.' },

  // Komunikacja
  { id: 's19', category: 'communication', text: 'Przekazuję informacje w sposób jasny i zrozumiały.' },
  { id: 's20', category: 'communication', text: 'Dostosowuję styl komunikacji do rozmówcy i sytuacji.' },
  { id: 's21', category: 'communication', text: 'Aktywnie słucham i sprawdzam, czy dobrze rozumiem drugą stronę.' },

  // Praktyczne rozwiązywanie problemów
  { id: 's22', category: 'problemSolving', text: 'Analizuję problemy, szukając przyczyn, a nie tylko skutków.' },
  { id: 's23', category: 'problemSolving', text: 'Potrafię działać efektywnie przy ograniczonych zasobach.' },
  { id: 's24', category: 'problemSolving', text: 'Testuję różne podejścia, aż znajdę skuteczne rozwiązanie.' },
];

const SJT_QUESTIONS = [
  {
    id: 'j1',
    scenario: 'Twój zespół ma oddać projekt jutro. Okazuje się, że kluczowy element jest niegotowy, a kolega odpowiedzialny za niego właśnie zachorował. Co robisz?',
    options: [
      { text: 'Informujesz przełożonego o problemie i od razu proponujesz plan awaryjny.',          scores: { initiative: 2, communication: 2 } },
      { text: 'Przejmujesz zadanie kolegi i pracujesz po godzinach, żeby zdążyć na termin.',        scores: { reliability: 2, collaboration: 1 } },
      { text: 'Oddajecie projekt bez brakującego elementu, z jasną adnotacją co i dlaczego.',       scores: { integrity: 2, communication: 1 } },
      { text: 'Czekasz na powrót kolegi, licząc że termin zostanie przesunięty.',                   scores: { reliability: -1, initiative: -1 } },
    ],
  },
  {
    id: 'j2',
    scenario: 'Podczas spotkania właśnie zatwierdzono plan działania. Ty dostrzegasz w nim poważną lukę. Co robisz?',
    options: [
      { text: 'Zgłaszasz problem od razu — lepiej teraz niż gdy będzie za późno.',                  scores: { initiative: 2, integrity: 2 } },
      { text: 'Mówisz o tym po spotkaniu, bezpośrednio przełożonemu lub autorowi planu.',           scores: { communication: 2, integrity: 1 } },
      { text: 'Zapisujesz obserwację dla siebie i obserwujesz, co się stanie.',                     scores: { initiative: -1, integrity: -1 } },
      { text: 'Czekasz, aż problem ujawni się sam — nie chcesz spowalniać grupy.',                 scores: { initiative: -2, integrity: -2 } },
    ],
  },
  {
    id: 'j3',
    scenario: 'Dostajesz informację zwrotną, że Twój sposób pracy irytuje kolegę z zespołu. Uważasz, że postępujesz właściwie. Co robisz?',
    options: [
      { text: 'Słuchasz uważnie i prosisz o konkretne przykłady, by lepiej zrozumieć.',             scores: { collaboration: 2, learning: 2 } },
      { text: 'Tłumaczysz logikę swojego działania i pokazujesz, dlaczego jest uzasadniona.',       scores: { communication: 1, collaboration: -1 } },
      { text: 'Zgadzasz się na zmiany, by utrzymać dobry klimat w zespole.',                        scores: { collaboration: 1, integrity: -1 } },
      { text: 'Prosisz przełożonego o mediację, bo sprawa wymaga neutralnego głosu.',               scores: { communication: 1, problemSolving: 1 } },
    ],
  },
  {
    id: 'j4',
    scenario: 'Masz wykonać zadanie, do którego brakuje Ci wiedzy. Termin za 3 dni. Co robisz?',
    options: [
      { text: 'Pytasz kogoś doświadczonego o pomoc — czas jest ważny, warto korzystać z zasobów.', scores: { learning: 2, collaboration: 2 } },
      { text: 'Próbujesz samodzielnie, korzystając z materiałów — to dobra okazja do nauki.',      scores: { learning: 2, initiative: 1 } },
      { text: 'Informujesz przełożonego i prosisz o wsparcie lub korektę terminu.',                 scores: { communication: 2, integrity: 2 } },
      { text: 'Robisz jak umiesz, zakładając że wystarczy.',                                        scores: { reliability: -1, integrity: -1 } },
    ],
  },
  {
    id: 'j5',
    scenario: 'Klient wyraża swoje niezadowolenie w agresywny i nieuprzejmy sposób. Co robisz?',
    options: [
      { text: 'Słuchasz spokojnie, nie reagujesz na agresję i szukasz źródła problemu.',           scores: { pressure: 2, communication: 2 } },
      { text: 'Wyjaśniasz stanowisko i spokojnie wskazujesz granice dopuszczalnej komunikacji.',    scores: { integrity: 2, pressure: 2 } },
      { text: 'Przepraszasz i obiecujesz poprawę, żeby szybko zakończyć napięcie.',                scores: { pressure: -1, integrity: -1 } },
      { text: 'Natychmiast eskalujesz sprawę do przełożonego.',                                    scores: { pressure: -1, problemSolving: -1 } },
    ],
  },
  {
    id: 'j6',
    scenario: 'Twój zespół utknął w realizacji projektu i nikt nie ma pomysłu, jak dalej. Co robisz?',
    options: [
      { text: 'Proponujesz zorganizowanie krótkiej sesji wspólnego myślenia o rozwiązaniach.',      scores: { initiative: 2, collaboration: 2 } },
      { text: 'Analizujesz problem samodzielnie i przychodzisz z konkretną propozycją.',            scores: { problemSolving: 2, initiative: 1 } },
      { text: 'Szukasz podobnych przypadków — być może ktoś już ten problem rozwiązał.',            scores: { learning: 2, problemSolving: 1 } },
      { text: 'Czekasz, aż ktoś z większym doświadczeniem przejmie inicjatywę.',                   scores: { initiative: -2, problemSolving: -1 } },
    ],
  },
];

const OPEN_QUESTIONS = [
  {
    id: 'o1',
    text: 'Opisz sytuację, w której Twoja praca miała realny wpływ na innych lub na wynik projektu. Co Cię w niej satysfakcjonuje?',
  },
  {
    id: 'o2',
    text: 'Jak zazwyczaj radzisz sobie, gdy coś idzie nie po planie? Podaj konkretny przykład.',
  },
  {
    id: 'o3',
    text: 'Czego nauczyłeś/nauczyłaś się w ostatnim roku w związku z pracą? Skąd pochodzi ta wiedza?',
  },
  {
    id: 'o4',
    text: 'Opisz trudną sytuację w relacji ze współpracownikiem lub klientem. Jak ją rozwiązałeś/rozwiązałaś?',
  },
  {
    id: 'o5',
    text: 'Co sprawia, że angażujesz się w pracę bardziej niż wymagane minimum?',
  },
];

const DEEP_DIVE_QUESTIONS = {
  reliability: [
    'Opowiedz o sytuacji, gdy dotrzymanie terminu było bardzo trudne. Co pomogło Ci go utrzymać?',
    'Czy zdarzyło Ci się nie dotrzymać obietnicy zawodowej? Co wtedy zrobiłeś/zrobiłaś?',
  ],
  pressure: [
    'Jak wyglądał Twój najtrudniejszy tydzień w pracy? Co pomogło Ci przez niego przejść?',
    'Opisz moment, gdy jednocześnie miałeś/miałaś kilka pilnych spraw. Jak decydowałeś/decydowałaś o kolejności?',
  ],
  collaboration: [
    'Kiedy ostatnio pomogłeś/pomogłaś komuś w zespole, gdy nie byłeś/byłaś do tego zobowiązany?',
    'Opisz sytuację, gdy Twoje zdanie różniło się od reszty zespołu. Jak to rozwiązaliście?',
  ],
  learning: [
    'Jaką umiejętność zdobyłeś/zdobyłaś samodzielnie, bez formalnego szkolenia?',
    'Jak reagujesz, gdy popełnisz błąd w pracy? Podaj konkretny przykład.',
  ],
  initiative: [
    'Opisz coś, co poprawiłeś/poprawiłaś w pracy, bez że ktoś Cię o to prosił.',
    'Kiedy ostatnio wyszłeś/wyszłaś poza zakres swoich obowiązków? Co Cię do tego skłoniło?',
  ],
  integrity: [
    'Opisz sytuację, gdy powiedzenie prawdy było trudne, ale konieczne.',
    'Jak postąpiłeś/postąpiłaś, gdy odkryłeś/odkryłaś błąd, który ktoś inny mógłby zignorować?',
  ],
  communication: [
    'Jak dostosujesz sposób tłumaczenia czegoś do osoby z zupełnie innym backgroundem?',
    'Opisz sytuację nieporozumienia w komunikacji. Co z niej wyciągnąłeś/wyciągnęłaś?',
  ],
  problemSolving: [
    'Opisz problem, który wydawał się nierozwiązywalny. Jak do niego podszedłeś/podeszłaś?',
    'Gdy masz mało czasu i zasobów — jak decydujesz, co jest najważniejsze?',
  ],
};
