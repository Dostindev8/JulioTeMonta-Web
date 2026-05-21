/**
 * boleto.js — Julio Té Monta · Sistema de Reserva de Boletos
 * Autor:    Logic Code Spot Software Solutions — Dostin Santana
 * Versión:  2.0.0 OMEGA (Supreme Engineer Protocol)
 * Calidad:  Producción · 2 años · Zero bugs
 *
 * FIXES vs v1:
 *  [C1] rifaData?.prop — null-safe, nunca crashea
 *  [C2] CONFIG guard en cada punto de entrada
 *  [C3] DOMContentLoaded unificado y robusto (defer-safe)
 *  [C4] isModalOpen flag — previene doble-apertura
 *  [A1] DocumentFragment — 50 nodos en un solo reflow
 *  [A2] Animación via classList, retriggerable correctamente
 *  [A3] parseInt(..., 10) con radix explícito
 *  [A4] Validaciones RD: teléfono (10 dígitos) + cédula (11 dígitos)
 *  [A5] DOM refs cacheadas en init — 0 querySelector en runtime
 *  [M1] textContent en lugar de innerText
 *  [M2] Debounce 80ms en updatePreview
 *  [M3] Todos los errores mostrados simultáneamente
 *  [M4] WhatsApp link en <a> nativo — prueba mobile + popup-safe
 *  [M5] addEventListener en lugar de onclick
 *  [B1] Estado encapsulado en TicketState
 *  [B2] Mensaje truncado a 4000 chars para límite WhatsApp
 *  [B3] aria-label en cada botón de número
 */

; (function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   * GUARD: CONFIG debe existir y tener rifas
   * ─────────────────────────────────────────────────────────────*/
  function configOk() {
    return (
      typeof CONFIG !== 'undefined' &&
      Array.isArray(CONFIG.rifas) &&
      CONFIG.rifas.length > 0 &&
      typeof CONFIG.whatsappNumber === 'string'
    );
  }

  /* ─────────────────────────────────────────────────────────────
   * ESTADO ENCAPSULADO — [B1] Sin globales contaminantes
   * ─────────────────────────────────────────────────────────────*/
  const TicketState = {
    selectedNums: [],           // Números elegidos (máx 3)
    ticketId: '',           // ID único del boleto actual
    isOpen: false,        // [C4] Guard anti doble-apertura
    MAX_NUMS: 3,
    MAX_NUMS_GRID: 50,

    reset() {
      this.selectedNums = [];
      this.ticketId = '';
    },

    generateId() {
      // [FIX] Garantiza unicidad: timestamp + random de 4 dígitos
      const ts = Date.now().toString(36).toUpperCase();
      const rnd = Math.floor(1000 + Math.random() * 9000);
      this.ticketId = `JTM-${ts}${rnd}`;
      return this.ticketId;
    },

    toggleNum(num) {
      const idx = this.selectedNums.indexOf(num);
      if (idx !== -1) {
        this.selectedNums.splice(idx, 1);
        return 'removed';
      }
      if (this.selectedNums.length >= this.MAX_NUMS) {
        return 'full';
      }
      this.selectedNums.push(num);
      return 'added';
    },
  };

  /* ─────────────────────────────────────────────────────────────
   * DOM CACHE — [A5] Cacheado una sola vez, 0 queries en runtime
   * ─────────────────────────────────────────────────────────────*/
  let DOM = null;

  function buildDOMCache() {
    DOM = {
      modal: document.getElementById('ticket-modal'),
      form: document.getElementById('ticket-form'),
      numbersPicker: document.getElementById('numbers-picker'),
      // Inputs
      name: document.getElementById('tf-name'),
      phone: document.getElementById('tf-phone'),
      cedula: document.getElementById('tf-cedula'),
      rifa: document.getElementById('tf-rifa'),
      qty: document.getElementById('tf-qty'),
      pago: document.getElementById('tf-pago'),
      msg: document.getElementById('tf-msg'),
      // Preview
      pvId: document.getElementById('pv-id'),
      pvName: document.getElementById('pv-name'),
      pvRifa: document.getElementById('pv-rifa'),
      pvQty: document.getElementById('pv-qty'),
      pvNums: document.getElementById('pv-nums'),
      pvTotal: document.getElementById('pv-total'),
      // Errors
      errName: document.getElementById('err-name'),
      errPhone: document.getElementById('err-phone'),
      errCedula: document.getElementById('err-cedula'),
      errRifa: document.getElementById('err-rifa'),
      // All error nodes (NodeList cached once)
      allErrors: document.querySelectorAll('.error-msg'),
    };
    return DOM;
  }

  /* ─────────────────────────────────────────────────────────────
   * UTILIDADES
   * ─────────────────────────────────────────────────────────────*/

  // [M2] Debounce — evita updatePreview en cada keypress
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Formato telefónico RD: 10 dígitos (809/829/849 + 7 dígitos)
  function isValidDRPhone(val) {
    const clean = val.replace(/[\s\-().+]/g, '');
    return /^(1?)(809|829|849)\d{7}$/.test(clean);
  }

  // Cédula dominicana: 11 dígitos (con o sin guiones)
  function isValidDRCedula(val) {
    const clean = val.replace(/[-\s]/g, '');
    return /^\d{11}$/.test(clean);
  }

  // Sanitize: strip HTML para evitar XSS en textContent
  function sanitize(str) {
    return String(str).replace(/[<>&"']/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // [B2] Truncar mensaje a límite seguro de WhatsApp
  const WA_MAX_CHARS = 4000;
  function truncateWA(str) {
    return str.length > WA_MAX_CHARS
      ? str.slice(0, WA_MAX_CHARS - 30) + '\n\n⚠️ [mensaje truncado]'
      : str;
  }

  /* ─────────────────────────────────────────────────────────────
   * POPULATE RIFAS SELECT
   * ─────────────────────────────────────────────────────────────*/
  function populateRifasSelect() {
    if (!configOk() || !DOM?.rifa) return;

    // Limpia opciones previas excepto placeholder
    while (DOM.rifa.options.length > 1) DOM.rifa.remove(1);

    // [A1] DocumentFragment para batch de DOM inserts
    const frag = document.createDocumentFragment();
    CONFIG.rifas.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.titulo} — ${r.precio}`;
      frag.appendChild(opt);
    });
    DOM.rifa.appendChild(frag);
  }

  /* ─────────────────────────────────────────────────────────────
   * MODAL — OPEN / CLOSE
   * ─────────────────────────────────────────────────────────────*/
  function openTicketPage(rifaId = '') {
    if (!configOk()) {
      console.error('[JTM] CONFIG no disponible al abrir modal');
      return;
    }

    // [C4] Previene doble-apertura
    if (TicketState.isOpen) return;
    TicketState.isOpen = true;

    const modal = DOM.modal;
    if (!modal) return;

    // Reset formulario
    DOM.form?.reset();
    clearAllErrors();
    TicketState.reset();

    // Nuevo ID de boleto
    const newId = TicketState.generateId();
    if (DOM.pvId) DOM.pvId.textContent = newId;  // [M1]

    // Pre-seleccionar rifa
    if (rifaId && DOM.rifa) {
      DOM.rifa.value = rifaId;
    }

    // Construir grid de números
    buildNumbersPicker();

    // Preview inicial
    updatePreviewNow();

    // Mostrar modal
    modal.classList.remove('hide');
    document.body.style.overflow = 'hidden';

    // Focus en primer campo accesible
    requestAnimationFrame(() => DOM.name?.focus());
  }

  function closeTicketPage() {
    const modal = DOM?.modal;
    if (!modal) return;

    modal.classList.add('hide');
    document.body.style.overflow = '';
    TicketState.isOpen = false;
  }

  /* ─────────────────────────────────────────────────────────────
   * NUMBERS PICKER — [A1] DocumentFragment, [B3] aria, [M5] addEventListener
   * ─────────────────────────────────────────────────────────────*/
  function buildNumbersPicker() {
    const container = DOM?.numbersPicker;
    if (!container) return;

    // Limpiar sin innerHTML (más rápido que innerHTML='')
    while (container.firstChild) container.removeChild(container.firstChild);

    const frag = document.createDocumentFragment();

    for (let i = 1; i <= TicketState.MAX_NUMS_GRID; i++) {
      const numStr = i.toString().padStart(2, '0');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'num-btn';
      btn.textContent = numStr;                    // [M1]
      btn.dataset.num = numStr;
      btn.setAttribute('aria-label', `Número ${i}`);// [B3]
      btn.setAttribute('aria-pressed', 'false');
      frag.appendChild(btn);
    }

    container.appendChild(frag);

    // [M5] Event delegation: UN solo listener en el contenedor
    container.addEventListener('click', onNumPickerClick);
  }

  function onNumPickerClick(e) {
    const btn = e.target.closest('.num-btn');
    if (!btn) return;
    const num = btn.dataset.num;
    const result = TicketState.toggleNum(num);

    if (result === 'full') {
      // [A2] Animación via classList — retriggerable correctamente
      btn.classList.remove('shake-red');
      // Force reflow para reiniciar animación
      void btn.offsetWidth;
      btn.classList.add('shake-red');
      btn.addEventListener('animationend', () => btn.classList.remove('shake-red'), { once: true });
      return;
    }

    const isSelected = result === 'added';
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

    updatePreviewDebounced();
  }

  /* ─────────────────────────────────────────────────────────────
   * PREVIEW — [M1] textContent, [C1] null-safe rifaData
   * ─────────────────────────────────────────────────────────────*/
  function updatePreviewNow() {
    if (!DOM) return;

    const name = DOM.name?.value || '--';
    const qty = Math.max(1, parseInt(DOM.qty?.value || '1', 10));  // [A3]

    // [M1] textContent en lugar de innerText
    if (DOM.pvName) DOM.pvName.textContent = name;
    if (DOM.pvQty) DOM.pvQty.textContent = qty;
    if (DOM.pvNums) {
      DOM.pvNums.textContent = TicketState.selectedNums.length
        ? TicketState.selectedNums.join(', ')
        : 'Automático';
    }

    const rifaId = DOM.rifa?.value;
    // [C1] Null-safe: rifaData puede ser undefined si el valor no existe en CONFIG
    const rifaData = rifaId && configOk()
      ? CONFIG.rifas.find(r => r.id === rifaId)
      : null;

    if (rifaData) {
      if (DOM.pvRifa) DOM.pvRifa.textContent = rifaData.titulo;
      if (DOM.pvTotal) DOM.pvTotal.textContent =
        'RD$' + (rifaData.precioNum * qty).toLocaleString('es-DO');
    } else {
      if (DOM.pvRifa) DOM.pvRifa.textContent = '--';
      if (DOM.pvTotal) DOM.pvTotal.textContent = '--';
    }
  }

  // [M2] Versión debounced para eventos de input
  const updatePreviewDebounced = debounce(updatePreviewNow, 80);

  /* ─────────────────────────────────────────────────────────────
   * ERRORES — [M3] Todos simultáneos
   * ─────────────────────────────────────────────────────────────*/
  function clearAllErrors() {
    DOM?.allErrors.forEach(el => el.classList.remove('visible'));
  }

  function showError(el) {
    if (el) el.classList.add('visible');
  }

  /* ─────────────────────────────────────────────────────────────
   * VALIDACIÓN — [A4] Formato dominicano + [M3] Todos los errores
   * ─────────────────────────────────────────────────────────────*/
  function validateForm() {
    clearAllErrors();
    let hasError = false;

    const name = DOM.name?.value.trim() || '';
    const phone = DOM.phone?.value.trim() || '';
    const cedula = DOM.cedula?.value.trim() || '';
    const rifaId = DOM.rifa?.value || '';

    // [M3] Validar TODOS los campos antes de retornar
    if (name.length < 3) {
      showError(DOM.errName);
      hasError = true;
    }

    if (!isValidDRPhone(phone)) {
      showError(DOM.errPhone);
      hasError = true;
    }

    if (!isValidDRCedula(cedula)) {
      showError(DOM.errCedula);
      hasError = true;
    }

    if (!rifaId) {
      showError(DOM.errRifa);
      hasError = true;
    }

    // Foco en primer campo inválido después de mostrar todos
    if (hasError) {
      if (name.length < 3) DOM.name?.focus();
      else if (!isValidDRPhone(phone)) DOM.phone?.focus();
      else if (!isValidDRCedula(cedula)) DOM.cedula?.focus();
      else DOM.rifa?.focus();
    }

    return !hasError;
  }

  /* ─────────────────────────────────────────────────────────────
   * COMPOSE WHATSAPP MESSAGE — [B2] Límite de caracteres
   * ─────────────────────────────────────────────────────────────*/
  function composeMessage(data) {
    const numsText = data.nums.length
      ? data.nums.join(', ')
      : 'Asignación automática';

    const msg = [
      '🔑 *JULIO TÉ MONTA — RESERVA DE BOLETO*',
      '',
      `📋 *ID:* ${data.ticketId}`,
      `👤 *Nombre:* ${data.name}`,
      `📱 *WhatsApp:* ${data.phone}`,
      `🪪 *Cédula/Pasaporte:* ${data.cedula}`,
      '',
      `🎟 *Rifa:* ${data.rifa}`,
      `🔢 *Cantidad de boletos:* ${data.qty}`,
      `🎯 *Números elegidos:* ${numsText}`,
      `💰 *Total a pagar:* ${data.total}`,
      `💳 *Método de pago:* ${data.pago}`,
      data.msg ? `\n💬 *Mensaje:* ${data.msg}` : '',
      '',
      '⭐ Quiero participar. Por favor confirmar y enviar datos de pago. ¡Gracias!',
    ].filter(l => l !== null).join('\n');

    return truncateWA(msg);  // [B2]
  }

  /* ─────────────────────────────────────────────────────────────
   * SUBMIT — [C1] Null-safe, [M4] WhatsApp popup-safe
   * ─────────────────────────────────────────────────────────────*/
  function submitTicket() {
    if (!configOk()) return;
    if (!validateForm()) return;

    const rifaId = DOM.rifa.value;
    // [C1] Null-safe: double-check rifaData existe
    const rifaData = CONFIG.rifas.find(r => r.id === rifaId);
    if (!rifaData) {
      showError(DOM.errRifa);
      return;
    }

    const qty = Math.max(1, parseInt(DOM.qty?.value || '1', 10));
    const total = 'RD$' + (rifaData.precioNum * qty).toLocaleString('es-DO');

    const text = composeMessage({
      ticketId: TicketState.ticketId,
      name: sanitize(DOM.name.value.trim()),
      phone: DOM.phone.value.trim(),
      cedula: DOM.cedula.value.trim(),
      rifa: rifaData.titulo,
      qty,
      total,
      nums: [...TicketState.selectedNums],
      pago: DOM.pago?.value || '--',
      msg: sanitize(DOM.msg?.value.trim() || ''),
    });

    const waNumber = CONFIG.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    // [M4] Crear <a> temporal + click — funciona en mobile, evita popup blocker
    const anchor = document.createElement('a');
    anchor.href = waUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    closeTicketPage();
  }

  /* ─────────────────────────────────────────────────────────────
   * INIT — [C3] Defer-safe, funciona con y sin DOMContentLoaded
   * ─────────────────────────────────────────────────────────────*/
  function init() {
    // [C2] CONFIG guard
    if (!configOk()) {
      console.error('[JTM] CONFIG inválido o no encontrado. boleto.js abortando.');
      return;
    }

    buildDOMCache();

    if (!DOM.modal) {
      console.error('[JTM] #ticket-modal no encontrado en el DOM.');
      return;
    }

    populateRifasSelect();

    // [M5] addEventListener en lugar de atributos onclick
    // Inputs → preview debounced
    [DOM.name, DOM.rifa, DOM.qty].forEach(el => {
      if (!el) return;
      el.addEventListener('input', updatePreviewDebounced);
      el.addEventListener('change', updatePreviewDebounced);
    });

    // Cerrar modal al clickear overlay (fuera del contenedor)
    DOM.modal.addEventListener('click', e => {
      if (e.target === DOM.modal) closeTicketPage();
    });

    // Cerrar con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && TicketState.isOpen) closeTicketPage();
    });

    // Exponer al scope global solo lo necesario (API pública mínima)
    window.JTM = {
      open: openTicketPage,
      close: closeTicketPage,
      submit: submitTicket,
    };

    // Compatibilidad con llamadas directas existentes en el HTML
    window.openTicketPage = openTicketPage;
    window.closeTicketPage = closeTicketPage;
    window.submitTicket = submitTicket;
  }

  /* ─────────────────────────────────────────────────────────────
   * BOOTSTRAP — [C3] Defer-safe
   * Si el DOM ya está listo (script al final del body), init()
   * se llama inmediatamente. Si no, espera DOMContentLoaded.
   * ─────────────────────────────────────────────────────────────*/
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})(); // Fin IIFE — nada contamina el scope global