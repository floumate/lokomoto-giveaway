// ============================================
// FORM — Glavni kontroler (Lokomoto Giveaway prijava)
// Config-driven step engine: čita Questions.STEPS i renderuje po tipu.
// Tok je linearan (nema grananja) → pratimo samo currentIndex.
// ============================================

const Form = (function() {

  let screensContainer = null;
  let progressBar = null;
  let progressBarFill = null;
  let globalBackBtn = null;

  let currentIndex = -1;             // -1 = welcome, STEPS.length = thanks
  let currentBackHandler = null;

  const STEPS = Questions.STEPS;
  const TOTAL = STEPS.length;

  // Cleanup hook za widget-e koji žive van trenutnog screen-a (flatpickr, global listeneri)
  let screenCleanup = null;
  let activeFlatpickr = null;

  // ---- Intl telefon (isto kao onboarding forma) ----
  const COUNTRIES = [
    { c: 'RS', n: 'Srbija',              d: '+381' },
    { c: 'BA', n: 'Bosna i Hercegovina', d: '+387' },
    { c: 'ME', n: 'Crna Gora',           d: '+382' },
    { c: 'HR', n: 'Hrvatska',            d: '+385' },
    { c: 'SI', n: 'Slovenija',           d: '+386' },
    { c: 'MK', n: 'Severna Makedonija',  d: '+389' },
    { c: 'AL', n: 'Albanija',            d: '+355' },
    { c: 'BG', n: 'Bugarska',            d: '+359' },
    { c: 'RO', n: 'Rumunija',            d: '+40'  },
    { c: 'HU', n: 'Mađarska',            d: '+36'  },
    { c: 'AT', n: 'Austrija',            d: '+43'  },
    { c: 'DE', n: 'Nemačka',             d: '+49'  },
    { c: 'CH', n: 'Švajcarska',          d: '+41'  },
    { c: 'IT', n: 'Italija',             d: '+39'  },
    { c: 'FR', n: 'Francuska',           d: '+33'  },
    { c: 'NL', n: 'Holandija',           d: '+31'  },
    { c: 'BE', n: 'Belgija',             d: '+32'  },
    { c: 'SE', n: 'Švedska',             d: '+46'  },
    { c: 'NO', n: 'Norveška',            d: '+47'  },
    { c: 'DK', n: 'Danska',              d: '+45'  },
    { c: 'GB', n: 'Velika Britanija',    d: '+44'  },
    { c: 'IE', n: 'Irska',               d: '+353' },
    { c: 'ES', n: 'Španija',             d: '+34'  },
    { c: 'PT', n: 'Portugal',            d: '+351' },
    { c: 'GR', n: 'Grčka',               d: '+30'  },
    { c: 'US', n: 'SAD',                 d: '+1'   },
    { c: 'CA', n: 'Kanada',              d: '+1'   },
    { c: 'AU', n: 'Australija',          d: '+61'  }
  ];

  // Pamti izbor zemlje + uneti broj kroz back/forward navigaciju
  let selectedCountry = findCountry('RS');
  let ipDetected = false;

  function findCountry(code) {
    if (!code) return null;
    for (let i = 0; i < COUNTRIES.length; i++) {
      if (COUNTRIES[i].c === code) return COUNTRIES[i];
    }
    return null;
  }

  function flagHtml(code) {
    if (!code || code.length !== 2) return '';
    return '<span class="fi fi-' + code.toLowerCase() + '"></span>';
  }


  function init() {
    screensContainer = document.getElementById('quizScreens');
    progressBar = document.getElementById('progressBar');
    progressBarFill = document.getElementById('progressBarFill');
    globalBackBtn = document.getElementById('globalBackBtn');

    globalBackBtn.addEventListener('click', () => {
      if (currentBackHandler) currentBackHandler();
    });

    showWelcome();
  }


  // ============================================
  // SCREEN HELPER
  // ============================================

  function setScreen(html, screenName, stepIndex, opts = {}) {
    // Očisti prethodni screen (flatpickr instanca, global listeneri)
    if (screenCleanup) { try { screenCleanup(); } catch (e) {} screenCleanup = null; }
    if (activeFlatpickr) { try { activeFlatpickr.destroy(); } catch (e) {} activeFlatpickr = null; }

    State.setCurrentScreen(screenName);

    screensContainer.innerHTML = `<div class="screen" data-screen="${screenName}">${html}</div>`;

    // Progress bar
    if (typeof stepIndex === 'number' && stepIndex >= 0) {
      const progress = ((stepIndex + 1) / TOTAL) * 100;
      progressBarFill.style.width = `${progress}%`;
      progressBar.classList.remove('hidden');
    } else {
      progressBar.classList.add('hidden');
    }

    // Back dugme
    if (opts.hideBack) {
      globalBackBtn.classList.add('hidden');
      currentBackHandler = null;
    } else {
      globalBackBtn.classList.remove('hidden');
      currentBackHandler = opts.backHandler || (() => goBack());
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // ============================================
  // NAVIGACIJA
  // ============================================

  function goToStep(index) {
    currentIndex = index;
    renderStep(index);
  }

  function goNext() {
    if (currentIndex < TOTAL - 1) {
      goToStep(currentIndex + 1);
    } else {
      submit();
    }
  }

  function goBack() {
    if (currentIndex <= 0) {
      showWelcome();
    } else {
      goToStep(currentIndex - 1);
    }
  }


  // ============================================
  // WELCOME SCREEN
  // ============================================

  function showWelcome() {
    currentIndex = -1;

    const html = `
      <div class="welcome-hero">
        <h1 class="welcome-hero__title">LOKOMOTO CENTAR GIVEAWAY</h1>

        <p class="welcome-hero__lead">
          Prijavljuješ se za giveaway u kom jedna osoba osvaja <strong>3 meseca kompletnog programa oporavka diskus hernije u Lokomoto centru</strong>.
        </p>

        <p class="welcome-hero__para">
          Program obuhvata kompletan klinički pregled, individualni plan oporavka, terapije, vežbe, praćenje napretka, redovne kontrole i završnu procenu.
        </p>

        <p class="welcome-hero__para">
          Ova forma nam pomaže da bolje razumemo tvoj problem, koliko dugo traje, koje simptome imaš, šta te trenutno najviše ograničava i da li si dobar kandidat za ovaj program.
        </p>

        <p class="welcome-hero__para">
          Popunjavanje forme ne znači automatski da si osvojio/la program. Na osnovu odgovora biramo osobu kojoj ovaj program može najviše da pomogne i koja je spremna da se aktivno uključi u proces oporavka.
        </p>

        <p class="welcome-hero__para">
          Svi kandidati koji ispune uslove za učešće ulaze u nasumično izvlačenje, a pobednika ćemo proglasiti uživo na Instagram live-u 24. Juna.
        </p>

        <p class="welcome-hero__para">Za popunjavanje ti treba oko <strong>3 minuta</strong>.</p>

        <p class="welcome-hero__para">Srećno 🚀</p>

        <div class="actions">
          <button class="btn btn--primary btn--large" id="startBtn">KRENI ›</button>
        </div>
      </div>
    `;

    setScreen(html, 'welcome', null, { hideBack: true });
    document.getElementById('startBtn').addEventListener('click', () => goToStep(0));
  }


  // ============================================
  // STEP DISPATCHER
  // ============================================

  function renderStep(index) {
    const step = STEPS[index];
    const renderers = {
      contact: renderContact,
      date: renderDate,
      text: renderText,
      textarea: renderTextarea,
      radio: renderRadio,
      checkbox: renderCheckbox,
      scale: renderScale,
      mri: renderMri,
      consent: renderConsent,
    };
    const fn = renderers[step.type];
    if (!fn) {
      console.error('Nepoznat tip step-a:', step.type);
      return;
    }
    fn(step, index);
  }

  function headerHtml(step) {
    const subtitle = step.subtitle ? `<p class="screen__subtitle">${step.subtitle}</p>` : '';
    return `<h2 class="screen__title">${step.title}</h2>${subtitle}`;
  }

  function actionsHtml(label = 'NASTAVI ›', id = 'continueBtn', disabled = false) {
    return `
      <div class="actions">
        <button class="btn btn--primary" id="${id}"${disabled ? ' disabled' : ''}>${label}</button>
      </div>
    `;
  }

  function errorHtml(id, message) {
    return `<div class="form-error" id="${id}" style="display:none;">${message}</div>`;
  }


  // ============================================
  // TYPE: CONTACT (ime, email, telefon)
  // ============================================

  function renderContact(step, index) {
    const savedName = State.getAnswer('ime_prezime') || '';
    const savedEmail = State.getAnswer('email') || '';
    const savedPhone = State.getAnswer('_telefon_national') || '';

    setScreen(`
      ${headerHtml(step)}
      <form class="contact-form" id="stepForm" novalidate>

        <div class="field" data-field="fullName">
          <label for="fullName">Ime i prezime <span class="required">*</span></label>
          <input type="text" id="fullName" name="fullName" autocomplete="name" placeholder="Ana Marković" value="${escapeAttr(savedName)}" />
          <span class="error-msg" id="fullNameError"></span>
        </div>

        <div class="field" data-field="email">
          <label for="email">Email <span class="required">*</span></label>
          <input type="email" id="email" name="email" autocomplete="email" placeholder="ana@primer.com" inputmode="email" value="${escapeAttr(savedEmail)}" />
          <span class="error-msg" id="emailError"></span>
        </div>

        <div class="field" data-field="phone">
          <label for="phone">Broj telefona <span class="required">*</span></label>
          <div class="phone-row" id="phoneRow">
            <button type="button" class="country-trigger" id="countryTrigger" aria-haspopup="listbox" aria-expanded="false">
              <span class="country-flag" id="countryFlag"></span>
              <span class="country-dial" id="countryDial"></span>
              <svg class="country-chevron" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <input type="tel" class="phone-input" id="phone" name="phone" autocomplete="tel-national" placeholder="60 123 4567" inputmode="tel" value="${escapeAttr(savedPhone)}" />
            <div class="dropdown" id="countryDropdown" hidden>
              <div class="dropdown-search"><input type="text" id="countrySearch" placeholder="Pretraži zemlje..." autocomplete="off" /></div>
              <div class="dropdown-list" id="countryList"></div>
            </div>
          </div>
          <span class="error-msg" id="phoneError"></span>
        </div>

        ${actionsHtml('NASTAVI ›', 'continueBtn')}
      </form>
    `, step.id, index);

    const form = document.getElementById('stepForm');
    const trigger = document.getElementById('countryTrigger');
    const flagEl = document.getElementById('countryFlag');
    const dialEl = document.getElementById('countryDial');
    const dropdown = document.getElementById('countryDropdown');
    const searchEl = document.getElementById('countrySearch');
    const listEl = document.getElementById('countryList');
    const phoneIn = document.getElementById('phone');

    function setCountry(country) {
      if (!country) return;
      selectedCountry = country;
      flagEl.innerHTML = flagHtml(country.c);
      dialEl.textContent = country.d;
      trigger.title = country.n + ' (' + country.d + ')';
      listEl.querySelectorAll('.country-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.code === country.c);
      });
      updatePhonePlaceholder();
    }

    function updatePhonePlaceholder() {
      if (!selectedCountry || !window.libphonenumber) return;
      try {
        const ex = libphonenumber.getExampleNumber(selectedCountry.c, libphonenumber.examples);
        if (ex) { phoneIn.placeholder = ex.formatNational(); return; }
      } catch (e) {}
      phoneIn.placeholder = '60 123 4567';
    }

    function renderCountryList(filter) {
      filter = (filter || '').trim().toLowerCase();
      let html = '';
      let matched = 0;
      for (let i = 0; i < COUNTRIES.length; i++) {
        const c = COUNTRIES[i];
        if (filter && c.n.toLowerCase().indexOf(filter) === -1 && c.d.indexOf(filter) === -1) continue;
        const isSel = selectedCountry && c.c === selectedCountry.c;
        html += '<button type="button" class="country-item' + (isSel ? ' selected' : '') + '" data-code="' + c.c + '" data-dial="' + c.d + '">' +
                  '<span class="country-item-flag">' + flagHtml(c.c) + '</span>' +
                  '<span class="country-item-name">' + c.n + '</span>' +
                  '<span class="country-item-dial">' + c.d + '</span>' +
                '</button>';
        matched++;
      }
      if (matched === 0) html = '<div style="padding:20px;text-align:center;color:var(--color-text-muted);font-size:14px;">Nema rezultata</div>';
      listEl.innerHTML = html;
    }

    function openDropdown() {
      dropdown.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      renderCountryList('');
      searchEl.value = '';
      setTimeout(() => searchEl.focus(), 50);
    }
    function closeDropdown() {
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.hidden) openDropdown(); else closeDropdown();
    });
    listEl.addEventListener('click', (e) => {
      const item = e.target.closest('.country-item');
      if (!item) return;
      const c = findCountry(item.dataset.code);
      if (c) { setCountry(c); closeDropdown(); phoneIn.focus(); }
    });
    searchEl.addEventListener('input', () => renderCountryList(searchEl.value));

    const onDocClick = (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    };
    document.addEventListener('click', onDocClick);
    screenCleanup = () => document.removeEventListener('click', onDocClick);

    setCountry(selectedCountry);

    // IP geolokacija — samo prvi put (posle koristi zapamćeni izbor)
    if (!ipDetected) {
      ipDetected = true;
      detectCountryByIP((code) => {
        if (!code) return;
        const c = findCountry(code);
        // Ne pregazi ako je korisnik već nešto upisao/izabrao
        if (c && !phoneIn.value.trim()) setCountry(c);
      });
    }

    function autoDetectFromDialCode() {
      const v = phoneIn.value.trim();
      if (!v.startsWith('+')) return;
      try {
        const parsed = libphonenumber.parsePhoneNumberFromString(v);
        if (parsed && parsed.country) {
          const c = findCountry(parsed.country);
          if (c && (!selectedCountry || selectedCountry.c !== c.c)) { setCountry(c); return; }
        }
      } catch (e) {}
      const sorted = COUNTRIES.slice().sort((a, b) => b.d.length - a.d.length);
      for (let i = 0; i < sorted.length; i++) {
        if (v.startsWith(sorted[i].d)) {
          if (!selectedCountry || selectedCountry.c !== sorted[i].c) setCountry(sorted[i]);
          return;
        }
      }
    }

    let attempted = false;

    phoneIn.addEventListener('input', () => {
      phoneIn.value = phoneIn.value.replace(/[^\d\s\-()+]/g, '');
      autoDetectFromDialCode();
      if (attempted) validatePhone();
    });

    document.getElementById('fullName').addEventListener('input', () => { if (attempted) validateName(); });
    document.getElementById('email').addEventListener('input', () => { if (attempted) validateEmail(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      attempted = true;
      const nameOk = validateName();
      const emailOk = validateEmail();
      const phoneOk = validatePhone();
      if (!nameOk || !emailOk || !phoneOk) {
        const firstErr = document.querySelector('.field.error input');
        if (firstErr) firstErr.focus();
        return;
      }

      const national = phoneIn.value.trim();
      const full = national.startsWith('+') ? national : (selectedCountry.d + ' ' + national);

      State.setAnswer('ime_prezime', document.getElementById('fullName').value.trim());
      State.setAnswer('email', document.getElementById('email').value.trim());
      State.setAnswer('telefon', full.replace(/\s+/g, ' ').trim());
      State.setAnswer('_telefon_national', national); // za prefill kroz back navigaciju
      goNext();
    });

    setTimeout(() => document.getElementById('fullName').focus(), 100);
  }


  // IP geolokacija sa fallback provajderima (isto kao onboarding forma)
  function detectCountryByIP(callback) {
    const providers = [
      { url: 'https://api.country.is/', field: 'country' },
      { url: 'https://ipwho.is/',        field: 'country_code' },
      { url: 'https://ipapi.co/json/',   field: 'country_code' }
    ];
    function tryProvider(idx) {
      if (idx >= providers.length) { callback(null); return; }
      const p = providers[idx];
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      fetch(p.url, { signal: ctrl.signal })
        .then(r => { clearTimeout(timer); if (!r.ok) throw new Error(); return r.json(); })
        .then(d => { const code = d && d[p.field]; if (code) callback(code); else throw new Error(); })
        .catch(() => tryProvider(idx + 1));
    }
    tryProvider(0);
  }


  // ---- Validatori za kontakt + datum (isto kao onboarding forma) ----

  function setFieldError(fieldName, msg) {
    const fieldEl = document.querySelector('.field[data-field="' + fieldName + '"]');
    const errEl = document.getElementById(fieldName + 'Error');
    if (fieldEl) fieldEl.classList.toggle('error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  }

  function validateName() {
    const v = (document.getElementById('fullName').value || '').trim();
    if (!v) { setFieldError('fullName', 'Ime i prezime su obavezni.'); return false; }
    const re = /^[A-Za-zŠĐČĆŽšđčćžÀ-ÿ'\-]{2,}(\s+[A-Za-zŠĐČĆŽšđčćžÀ-ÿ'\-]{2,})+$/;
    if (!re.test(v.replace(/\s+/g, ' '))) { setFieldError('fullName', 'Unesi i ime i prezime.'); return false; }
    setFieldError('fullName', null); return true;
  }

  function validateEmail() {
    const v = (document.getElementById('email').value || '').trim();
    if (!v) { setFieldError('email', 'Email je obavezan.'); return false; }
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(v) || v.length > 254) { setFieldError('email', 'Email adresa nije validna.'); return false; }
    setFieldError('email', null); return true;
  }

  function validatePhone() {
    const v = (document.getElementById('phone').value || '').trim();
    if (!v) { setFieldError('phone', 'Broj telefona je obavezan.'); return false; }
    if (!window.libphonenumber) {
      if (v.replace(/\D/g, '').length < 6) { setFieldError('phone', 'Broj telefona nije validan.'); return false; }
      setFieldError('phone', null); return true;
    }
    try {
      const full = v.startsWith('+') ? v : selectedCountry.d + ' ' + v;
      if (!libphonenumber.isValidPhoneNumber(full)) {
        setFieldError('phone', 'Broj telefona nije validan za izabranu zemlju.'); return false;
      }
    } catch (e) { setFieldError('phone', 'Broj telefona nije validan.'); return false; }
    setFieldError('phone', null); return true;
  }


  // ============================================
  // TYPE: DATE
  // ============================================

  function renderDate(step, index) {
    const saved = State.getAnswer(step.id) || '';

    setScreen(`
      ${headerHtml(step)}
      <form class="contact-form" id="stepForm" novalidate>
        <div class="field" data-field="birth">
          <label for="birthDisplay">Datum rođenja <span class="required">*</span></label>
          <div class="datepicker-input-wrap">
            <input type="text" id="birthDisplay" class="datepicker-display" readonly placeholder="Izaberi datum" />
            <svg class="datepicker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <input type="hidden" id="birthHidden" value="${escapeAttr(saved)}" />
          <span class="error-msg" id="birthError"></span>
        </div>
        ${actionsHtml('NASTAVI ›', 'continueBtn')}
      </form>
    `, step.id, index);

    const form = document.getElementById('stepForm');
    const display = document.getElementById('birthDisplay');
    const hidden = document.getElementById('birthHidden');

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }
    function dateToISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

    // Prefill kao Date objekat (ISO string bi flatpickr pogrešno parsirao zbog 'j. F Y.' formata)
    let defaultDateObj = null;
    if (saved) {
      const p = saved.split('-');
      if (p.length === 3) defaultDateObj = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }

    if (typeof flatpickr !== 'undefined') {
      activeFlatpickr = flatpickr(display, {
        dateFormat: 'j. F Y.',
        locale: 'sr',
        maxDate: 'today',
        monthSelectorType: 'dropdown',
        disableMobile: true,
        appendTo: document.body,
        defaultDate: defaultDateObj,
        onChange: function (selectedDates) {
          if (selectedDates.length) {
            hidden.value = dateToISO(selectedDates[0]);
            setFieldError('birth', null);
          } else {
            hidden.value = '';
          }
        },
        onReady: function () {
          const defaultYear = new Date().getFullYear() - 30;
          if (this.currentYear !== defaultYear && !this.selectedDates.length) {
            this.changeYear(defaultYear);
          }
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!hidden.value) {
        setFieldError('birth', 'Datum rođenja je obavezan.');
        return;
      }
      setFieldError('birth', null);
      State.setAnswer(step.id, hidden.value);
      goNext();
    });
  }


  // ============================================
  // TYPE: TEXT / TEXTAREA
  // ============================================

  function renderText(step, index) { renderTextLike(step, index, false); }
  function renderTextarea(step, index) { renderTextLike(step, index, true); }

  function renderTextLike(step, index, multiline) {
    const saved = State.getAnswer(step.id) || '';
    const control = multiline
      ? `<textarea id="textInput" class="form-textarea" placeholder="${escapeAttr(step.placeholder || '')}" rows="5">${escapeHtml(saved)}</textarea>`
      : `<input type="text" id="textInput" placeholder="${escapeAttr(step.placeholder || '')}" value="${escapeAttr(saved)}" />`;

    setScreen(`
      ${headerHtml(step)}
      <form class="lead-form" id="stepForm" novalidate>
        <div class="form-field">
          ${control}
          <span class="form-field__error" id="textErr"></span>
        </div>
        ${actionsHtml('NASTAVI ›', 'continueBtn')}
      </form>
    `, step.id, index);

    const form = document.getElementById('stepForm');
    const input = document.getElementById('textInput');
    const errEl = document.getElementById('textErr');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (step.required !== false && val.length === 0) {
        input.classList.add('input--error');
        errEl.textContent = 'Ovo polje je obavezno';
        return;
      }
      input.classList.remove('input--error');
      errEl.textContent = '';
      State.setAnswer(step.id, val);
      goNext();
    });

    setTimeout(() => input.focus(), 100);
  }


  // ============================================
  // TYPE: RADIO (auto-next, sa opcionim conditional input)
  // ============================================

  function renderRadio(step, index) {
    const saved = State.getAnswer(step.id);
    const hasConditional = !!step.conditional;

    const optionsHtml = step.options.map(opt => {
      const isSel = saved === opt.value;
      return `
        <button type="button" class="option ${isSel ? 'selected' : ''}" data-value="${escapeAttr(opt.value)}">
          <span class="option__indicator"></span>
          <span class="option__text">${opt.value}</span>
        </button>
      `;
    }).join('');

    let conditionalHtml = '';
    if (hasConditional) {
      const c = step.conditional;
      const savedCond = State.getAnswer(c.id) || '';
      const open = saved === c.whenValue;
      conditionalHtml = `
        <div class="conditional-field ${open ? 'is-open' : ''}" id="conditionalField">
          <label class="conditional-field__label" for="conditionalInput">${c.label}</label>
          <textarea id="conditionalInput" class="form-textarea" rows="3" placeholder="${escapeAttr(c.placeholder || '')}">${escapeHtml(savedCond)}</textarea>
        </div>
      `;
    }

    // Conditional korak ima NASTAVI dugme (jer "Da" ne ide auto-next);
    // čisti radio koraci nemaju dugme.
    const showContinue = hasConditional && saved === step.conditional.whenValue;
    const actions = hasConditional
      ? `<div class="actions" id="condActions" style="${showContinue ? '' : 'display:none;'}">
           <button class="btn btn--primary" id="continueBtn">NASTAVI ›</button>
         </div>`
      : '';

    setScreen(`
      ${headerHtml(step)}
      <div class="options-list">${optionsHtml}</div>
      ${conditionalHtml}
      ${actions}
    `, step.id, index);

    const options = Array.from(document.querySelectorAll('.option'));

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const value = opt.dataset.value;
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');

        if (hasConditional && value === step.conditional.whenValue) {
          // Otvori input, prikaži NASTAVI, NE idi auto-next
          State.setAnswer(step.id, value);
          const field = document.getElementById('conditionalField');
          const acts = document.getElementById('condActions');
          field.classList.add('is-open');
          acts.style.display = '';
          setTimeout(() => document.getElementById('conditionalInput').focus(), 150);
        } else {
          // Auto-next
          if (hasConditional) {
            document.getElementById('conditionalField').classList.remove('is-open');
            document.getElementById('condActions').style.display = 'none';
            State.setAnswer(step.conditional.id, ''); // očisti opis ako je prešao na "Ne"
          }
          options.forEach(o => o.disabled = true);
          State.setAnswer(step.id, value);
          setTimeout(() => goNext(), 200);
        }
      });
    });

    if (hasConditional) {
      const continueBtn = document.getElementById('continueBtn');
      continueBtn.addEventListener('click', () => {
        const txt = document.getElementById('conditionalInput').value.trim();
        State.setAnswer(step.conditional.id, txt);
        goNext();
      });
    }
  }


  // ============================================
  // TYPE: CHECKBOX (multi-select, opciono "Ostalo")
  // Odgovor se čuva kao { values: [...], otherText: '' }
  // ============================================

  function renderCheckbox(step, index) {
    const saved = State.getAnswer(step.id) || { values: [], otherText: '' };

    const optionsHtml = step.options.map(opt => {
      const isSel = saved.values.includes(opt.value);
      return `
        <button type="button" class="option option--multiselect ${isSel ? 'selected' : ''}" data-value="${escapeAttr(opt.value)}">
          <span class="option__checkbox"></span>
          <span class="option__text">${opt.value}</span>
        </button>
      `;
    }).join('');

    const otherSelected = !!saved.otherText;
    const otherHtml = step.hasOther ? `
      <button type="button" class="option option--multiselect ${otherSelected ? 'selected' : ''}" id="otherToggle" data-value="__other__">
        <span class="option__checkbox"></span>
        <span class="option__text">Ostalo</span>
      </button>
      <div class="conditional-field ${otherSelected ? 'is-open' : ''}" id="otherField">
        <input type="text" id="otherInput" placeholder="Napiši šta još…" value="${escapeAttr(saved.otherText || '')}" />
      </div>
    ` : '';

    setScreen(`
      ${headerHtml(step)}
      <div class="options-list" id="optList">
        ${optionsHtml}
        ${otherHtml}
      </div>
      ${errorHtml('listErr', 'Izaberi bar jednu opciju da bi nastavio dalje.')}
      ${actionsHtml('NASTAVI ›', 'continueBtn')}
    `, step.id, index);

    const listEl = document.getElementById('optList');
    const errEl = document.getElementById('listErr');
    const continueBtn = document.getElementById('continueBtn');
    let attempted = false;

    function clearError() {
      errEl.style.display = 'none';
      listEl.classList.remove('options-list--error');
    }

    // Multi-select opcije (sve osim "Ostalo")
    document.querySelectorAll('.option--multiselect:not(#otherToggle)').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('selected');
        if (attempted) revalidate();
      });
    });

    // "Ostalo" toggle
    if (step.hasOther) {
      const otherToggle = document.getElementById('otherToggle');
      const otherField = document.getElementById('otherField');
      const otherInput = document.getElementById('otherInput');

      otherToggle.addEventListener('click', () => {
        const nowSel = !otherToggle.classList.contains('selected');
        otherToggle.classList.toggle('selected', nowSel);
        otherField.classList.toggle('is-open', nowSel);
        if (nowSel) setTimeout(() => otherInput.focus(), 150);
        else otherInput.value = '';
        if (attempted) revalidate();
      });

      otherInput.addEventListener('input', () => { if (attempted) revalidate(); });
    }

    function collect() {
      const values = Array.from(document.querySelectorAll('.option--multiselect.selected:not(#otherToggle)'))
        .map(el => el.dataset.value);
      let otherText = '';
      let otherChecked = false;
      if (step.hasOther) {
        otherChecked = document.getElementById('otherToggle').classList.contains('selected');
        otherText = document.getElementById('otherInput').value.trim();
      }
      return { values, otherChecked, otherText };
    }

    function revalidate() {
      const { values, otherChecked, otherText } = collect();
      const hasAny = values.length > 0 || (otherChecked && otherText.length > 0);
      const otherEmpty = otherChecked && otherText.length === 0;
      if (hasAny && !otherEmpty) { clearError(); return true; }
      errEl.textContent = otherEmpty
        ? 'Napiši šta još imaš u polju „Ostalo”.'
        : 'Izaberi bar jednu opciju da bi nastavio dalje.';
      errEl.style.display = 'block';
      listEl.classList.add('options-list--error');
      return false;
    }

    continueBtn.addEventListener('click', () => {
      attempted = true;
      if (!revalidate()) return;
      const { values, otherChecked, otherText } = collect();
      State.setAnswer(step.id, { values, otherText: otherChecked ? otherText : '' });
      goNext();
    });
  }


  // ============================================
  // TYPE: SCALE (1–10 slider)
  // ============================================

  function renderScale(step, index) {
    const min = step.min ?? 1;
    const max = step.max ?? 10;
    const saved = State.getAnswer(step.id);
    const initial = saved ?? Math.round((min + max) / 2);

    setScreen(`
      ${headerHtml(step)}
      <div class="scale-container">
        <div class="scale-value" id="scaleValue">${initial}</div>
        <div class="scale-labels">
          <span>${step.minLabel || min}</span>
          <span>${step.maxLabel || max}</span>
        </div>
        <input type="range" min="${min}" max="${max}" value="${initial}" step="1" class="scale-slider" id="scaleSlider" />
        <div class="scale-numbers scale-numbers--edges-only">
          <span>${min}</span>
          <span>${max}</span>
        </div>
      </div>
      ${actionsHtml('NASTAVI ›', 'continueBtn', saved == null)}
    `, step.id, index);

    const slider = document.getElementById('scaleSlider');
    const valueDisplay = document.getElementById('scaleValue');
    const continueBtn = document.getElementById('continueBtn');
    let userInteracted = saved != null;

    function updateBg(value) {
      const pct = ((value - min) / (max - min)) * 100;
      slider.style.setProperty('--scale-progress', `${pct}%`);
      let color;
      if (pct <= 30) color = '#10b981';
      else if (pct <= 65) color = '#f59e0b';
      else color = '#ef4444';
      valueDisplay.style.color = color;
    }
    updateBg(initial);

    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      valueDisplay.textContent = value;
      updateBg(value);
      if (!userInteracted) { userInteracted = true; continueBtn.disabled = false; }
    });

    continueBtn.addEventListener('click', () => {
      State.setAnswer(step.id, parseInt(slider.value, 10));
      goNext();
    });
  }


  // ============================================
  // TYPE: MRI (radio + opcioni upload, isti step)
  // ============================================

  function renderMri(step, index) {
    const saved = State.getAnswer(step.id);
    const optionsHtml = step.options.map(opt => `
      <button type="button" class="option ${saved === opt.value ? 'selected' : ''}" data-value="${escapeAttr(opt.value)}">
        <span class="option__indicator"></span>
        <span class="option__text">${opt.value}</span>
      </button>
    `).join('');

    setScreen(`
      ${headerHtml(step)}
      <div class="options-list" id="optList">${optionsHtml}</div>
      ${errorHtml('listErr', 'Izaberi jednu opciju da bi nastavio dalje.')}

      <div class="upload-block">
        <p class="upload-block__label">${step.upload.label}</p>
        <p class="upload-block__hint">${step.upload.hint}</p>
        <input type="file" id="mriInput" accept="image/*,application/pdf" hidden />
        <button type="button" class="upload-btn" id="mriBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Priloži snimak
        </button>
        <div class="upload-file" id="mriFileRow" style="display:none;">
          <span class="upload-file__name" id="mriFileName"></span>
          <button type="button" class="upload-file__remove" id="mriRemove" aria-label="Ukloni">✕</button>
        </div>
        <span class="form-field__error" id="mriErr"></span>
      </div>

      ${actionsHtml('NASTAVI ›', 'continueBtn')}
    `, step.id, index);

    const options = Array.from(document.querySelectorAll('.option'));
    const listEl = document.getElementById('optList');
    const errEl = document.getElementById('listErr');
    const continueBtn = document.getElementById('continueBtn');

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        State.setAnswer(step.id, opt.dataset.value);
        errEl.style.display = 'none';
        listEl.classList.remove('options-list--error');
      });
    });

    // Upload handling
    const fileInput = document.getElementById('mriInput');
    const mriBtn = document.getElementById('mriBtn');
    const fileRow = document.getElementById('mriFileRow');
    const fileName = document.getElementById('mriFileName');
    const fileErr = document.getElementById('mriErr');
    const MAX_BYTES = 5 * 1024 * 1024;

    // Prikaži već priložen fajl (back navigacija)
    const existing = State.getMriFile();
    if (existing) { fileName.textContent = existing.name; fileRow.style.display = 'flex'; }

    mriBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      fileErr.textContent = '';
      const file = fileInput.files[0];
      if (!file) return;
      if (file.size > MAX_BYTES) {
        fileErr.textContent = 'Fajl je prevelik (maksimalno 5MB).';
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1] || '';
        State.setMriFile({ name: file.name, type: file.type, base64 });
        fileName.textContent = file.name;
        fileRow.style.display = 'flex';
      };
      reader.onerror = () => { fileErr.textContent = 'Greška pri čitanju fajla.'; };
      reader.readAsDataURL(file);
    });

    document.getElementById('mriRemove').addEventListener('click', () => {
      State.setMriFile(null);
      fileInput.value = '';
      fileRow.style.display = 'none';
    });

    continueBtn.addEventListener('click', () => {
      if (!State.getAnswer(step.id)) {
        errEl.textContent = 'Izaberi jednu opciju da bi nastavio dalje.';
        errEl.style.display = 'block';
        listEl.classList.add('options-list--error');
        return;
      }
      goNext();
    });
  }


  // ============================================
  // TYPE: CONSENT (više Da/Ne pitanja na jednom step-u)
  // ============================================

  function renderConsent(step, index) {
    const questionsHtml = step.questions.map(q => {
      const saved = State.getAnswer(q.id);
      return `
        <div class="consent-q" data-qid="${q.id}">
          <p class="consent-q__text">${q.text}</p>
          <div class="consent-q__options">
            <button type="button" class="consent-pill ${saved === 'Da' ? 'selected' : ''}" data-value="Da">Da</button>
            <button type="button" class="consent-pill ${saved === 'Ne' ? 'selected' : ''}" data-value="Ne">Ne</button>
          </div>
        </div>
      `;
    }).join('');

    setScreen(`
      ${headerHtml(step)}
      <div class="consent-list">${questionsHtml}</div>
      ${errorHtml('consentErr', 'Odgovori na sva pitanja da bi završio prijavu.')}
      ${actionsHtml('POŠALJI PRIJAVU ›', 'continueBtn')}
    `, step.id, index);

    const errEl = document.getElementById('consentErr');
    const continueBtn = document.getElementById('continueBtn');

    document.querySelectorAll('.consent-q').forEach(qEl => {
      const qid = qEl.dataset.qid;
      qEl.querySelectorAll('.consent-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          qEl.querySelectorAll('.consent-pill').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
          State.setAnswer(qid, pill.dataset.value);
          errEl.style.display = 'none';
        });
      });
    });

    continueBtn.addEventListener('click', () => {
      const allAnswered = step.questions.every(q => State.getAnswer(q.id));
      if (!allAnswered) {
        errEl.style.display = 'block';
        return;
      }
      goNext();
    });
  }


  // ============================================
  // SUBMIT → webhook → thank you
  // ============================================

  async function submit() {
    const btn = document.getElementById('continueBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'ŠALJEM...'; }

    const payload = buildPayload();
    const result = await API.submitForm(payload);

    if (!result.success) {
      if (btn) { btn.disabled = false; btn.textContent = 'POŠALJI PRIJAVU ›'; }
      const errEl = document.getElementById('consentErr');
      if (errEl) {
        errEl.textContent = 'Došlo je do greške pri slanju. Pokušaj ponovo.';
        errEl.style.display = 'block';
      }
      return;
    }

    showThanks();
  }

  function buildPayload() {
    const a = State.getAllAnswers();
    const mri = State.getMriFile();

    const payload = {
      submitted_at: new Date().toISOString(),
      source: 'lokomoto-giveaway-funnel',

      ime_prezime: a.ime_prezime || '',
      email: a.email || '',
      telefon: a.telefon || '',
      datum_rodjenja: a.datum_rodjenja || '',

      problemi: listToString(a.problemi),
      trajanje_problema: a.trajanje_problema || '',
      jacina_bola: a.jacina_bola != null ? String(a.jacina_bola) : '',
      opis_simptoma: a.opis_simptoma || '',

      ima_mr_snimak: a.ima_mr_snimak || '',
      nalaz: listToString(a.nalaz),

      probane_terapije: listToString(a.probane_terapije),
      sta_je_pomoglo: listToString(a.sta_je_pomoglo),
      zeljeni_rezultat: listToString(a.zeljeni_rezultat),

      stopalo_pada: a.stopalo_pada || '',
      kontrola_mokrenja: a.kontrola_mokrenja || '',
      temperatura_gubitak_tezine: a.temperatura_gubitak_tezine || '',
      trauma: a.trauma || '',
      trauma_opis: a.trauma_opis || '',
      terapija_lekara: a.terapija_lekara || '',
      moze_dolaziti_3x: a.moze_dolaziti_3x || '',

      saglasnost_dolasci: a.saglasnost_dolasci || '',
      saglasnost_dokumentovanje: a.saglasnost_dokumentovanje || '',
      saglasnost_edukativni: a.saglasnost_edukativni || '',

      // MRI fajl — Make: "Google Drive > Upload a file" pa link u Sheets
      mr_snimak_fajl_ime: mri ? mri.name : '',
      mr_snimak_fajl_tip: mri ? mri.type : '',
      mr_snimak_fajl_base64: mri ? mri.base64 : '',

      utm: State.getUtmParams(),
      device_type: API.getDeviceType(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    };

    return payload;
  }


  // ============================================
  // THANK YOU
  // ============================================

  function showThanks() {
    currentIndex = TOTAL;
    const html = `
      <div class="thanks">
        <div class="thanks__icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <h2 class="thanks__title">Hvala ti na prijavi</h2>

        <div class="thanks__ps">
          P.S.&nbsp; Dupliraj svoju šansu: Ukoliko ti preporučiš prijatelju da se prijavi i on pobedi — nagradu osvajaš i ti 🍀
        </div>

        <!-- REFERRAL LINK — dolazi kasnije (ceo referral sistem radimo naknadno).
             Ovde ide korisnikov jedinstveni link za deljenje, ispod P.S. teksta. -->
        <div class="thanks__referral" id="referralSlot" hidden></div>
      </div>
    `;
    setScreen(html, 'thanks', null, { hideBack: true });
  }


  // ============================================
  // VALIDATORI / HELPERI
  // ============================================

  function validateField(type, value) {
    const v = (value || '').trim();
    if (type === 'name') {
      if (v.length === 0) return { valid: false, error: 'Ime i prezime je obavezno' };
      if (v.length < 2) return { valid: false, error: 'Unesi bar 2 karaktera' };
      return { valid: true };
    }
    if (type === 'email') {
      if (v.length === 0) return { valid: false, error: 'Email je obavezan' };
      if (!isValidEmail(v)) return { valid: false, error: 'Email nije validan' };
      return { valid: true };
    }
    if (type === 'phone') {
      if (v.length === 0) return { valid: false, error: 'Broj telefona je obavezan' };
      if (!isValidPhone(v)) return { valid: false, error: 'Broj telefona nije validan' };
      return { valid: true };
    }
    return { valid: true };
  }

  function isValidEmail(email) {
    if (!email || /\s/.test(email)) return false;
    if ((email.match(/@/g) || []).length !== 1) return false;
    const [local, domain] = email.split('@');
    if (!local || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    if (!domain || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
    const parts = domain.split('.');
    if (parts.length < 2 || parts.some(p => p.length === 0)) return false;
    if (parts[parts.length - 1].length < 2) return false;
    if (!/^[a-zA-Z0-9._+-]+$/.test(local)) return false;
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;
    return true;
  }

  function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-()./]/g, '');
    if (!/^\+?\d+$/.test(cleaned)) return false;
    const digits = cleaned.replace(/^\+/, '');
    return digits.length >= 6 && digits.length <= 15;
  }

  function listToString(ans) {
    if (!ans) return '';
    const out = [...(ans.values || [])];
    if (ans.otherText) out.push(ans.otherText);
    return out.join(', ');
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


  return { init };

})();


// Radi i kao samostalna stranica i kao Webflow embed (gde DOMContentLoaded može već da prođe)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Form.init());
} else {
  Form.init();
}

console.log('[form.js] učitan');
