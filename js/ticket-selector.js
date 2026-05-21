/**
 * ticket-selector.js — Boletos por rango, modo manual (grid) o automático
 */
(function () {
  const PAGE_SIZE = 120;

  function isSold(n, min, max) {
    return ((n * 7919 + min * 13) % 100) < 4;
  }

  function fmt(n) {
    return n.toLocaleString('en-US');
  }

  function init(wrap) {
    const min = parseInt(wrap.dataset.min, 10);
    const max = parseInt(wrap.dataset.max, 10);
    if (isNaN(min) || isNaN(max)) return;

    const hidden = wrap.querySelector('input[name="boleto"]');
    const label = wrap.querySelector('.ts-range-label');
    const statusEl = wrap.querySelector('.ts-status');
    const grid = wrap.querySelector('.ts-grid');
    const autoPanel = wrap.querySelector('.ts-auto-panel');
    const manualPanel = wrap.querySelector('.ts-manual-panel');
    const autoResult = wrap.querySelector('.ts-auto-result');
    const searchIn = wrap.querySelector('.ts-search-input');
    const pagerInfo = wrap.querySelector('.ts-pager-info');
    const btnPrev = wrap.querySelector('.ts-prev');
    const btnNext = wrap.querySelector('.ts-next');
    const btnAutoGen = wrap.querySelector('.ts-gen-auto');
    const modeBtns = wrap.querySelectorAll('.ts-mode-btn');

    const parent = wrap.closest('[data-participacion]');
    if (parent) {
      const accent = getComputedStyle(parent).getPropertyValue('--part-accent').trim();
      if (accent) wrap.style.setProperty('--ts-accent', accent);
    }

    if (label) {
      label.textContent = 'Elige tus números (' + fmt(min) + ' - ' + fmt(max) + ')';
    }

    let selected = null;
    let page = 0;
    let mode = 'manual';
    const total = max - min + 1;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    function availableList() {
      const list = [];
      for (let n = min; n <= max; n++) {
        if (!isSold(n, min, max)) list.push(n);
      }
      return list;
    }

    function updateStatus() {
      if (!statusEl) return;
      if (selected) {
        statusEl.innerHTML = 'Seleccionado: <b style="font-size:1.05rem"># ' + fmt(selected) + '</b>';
        statusEl.style.color = 'var(--ts-accent)';
      } else {
        statusEl.textContent = 'Seleccionados: 0 / 1';
      }
    }

    function setSelected(n, scrollGrid) {
      if (n == null || isSold(n, min, max) || n < min || n > max) return false;
      selected = n;
      hidden.value = String(n);
      updateStatus();
      if (mode === 'manual') {
        page = Math.floor((n - min) / PAGE_SIZE);
        renderGrid();
        if (scrollGrid && grid) {
          const el = grid.querySelector('[data-n="' + n + '"]');
          if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
      if (mode === 'auto' && autoResult) {
        autoResult.textContent = '# ' + fmt(n);
      }
      return true;
    }

    function renderGrid() {
      if (!grid) return;
      grid.innerHTML = '';
      const start = min + page * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE - 1, max);
      const frag = document.createDocumentFragment();

      for (let n = start; n <= end; n++) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'ts-item';
        el.dataset.n = n;
        el.textContent = fmt(n);
        if (isSold(n, min, max)) {
          el.classList.add('sold');
          el.disabled = true;
        } else if (n === selected) {
          el.classList.add('selected');
        }
        el.addEventListener('click', function () {
          if (!el.classList.contains('sold')) setSelected(n, false);
        });
        frag.appendChild(el);
      }
      grid.appendChild(frag);
      if (pagerInfo) {
        pagerInfo.textContent = 'Página ' + (page + 1) + ' de ' + totalPages + ' · ' + fmt(start) + '–' + fmt(end);
      }
      if (btnPrev) btnPrev.disabled = page <= 0;
      if (btnNext) btnNext.disabled = page >= totalPages - 1;
    }

    function pickRandom() {
      const avail = availableList();
      if (!avail.length) return null;
      return avail[Math.floor(Math.random() * avail.length)];
    }

    function setMode(m) {
      mode = m;
      modeBtns.forEach(function (b) {
        b.classList.toggle('active', b.dataset.mode === m);
      });
      if (autoPanel) autoPanel.classList.toggle('active', m === 'auto');
      if (manualPanel) manualPanel.classList.toggle('active', m === 'manual');
      if (m === 'auto' && !selected) {
        const r = pickRandom();
        if (r) setSelected(r, false);
      }
      if (m === 'manual') renderGrid();
    }

    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.dataset.mode);
      });
    });

    if (btnPrev) {
      btnPrev.addEventListener('click', function () {
        if (page > 0) {
          page--;
          renderGrid();
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function () {
        if (page < totalPages - 1) {
          page++;
          renderGrid();
        }
      });
    }

    if (searchIn) {
      searchIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          wrap.querySelector('.ts-jump-btn')?.click();
        }
      });
    }

    wrap.querySelector('.ts-jump-btn')?.addEventListener('click', function () {
      const v = parseInt((searchIn?.value || '').replace(/\D/g, ''), 10);
      if (isNaN(v)) return;
      if (v < min || v > max) {
        alert('El número debe estar entre ' + fmt(min) + ' y ' + fmt(max));
        return;
      }
      if (isSold(v, min, max)) {
        alert('Ese boleto no está disponible. Elige otro.');
        return;
      }
      setMode('manual');
      setSelected(v, true);
    });

    if (btnAutoGen) {
      btnAutoGen.addEventListener('click', function () {
        const r = pickRandom();
        if (r) setSelected(r, false);
        else alert('No hay boletos disponibles en este momento.');
      });
    }

    setMode('manual');
    updateStatus();
  }

  document.querySelectorAll('[data-ticket-selector]').forEach(init);
})();
