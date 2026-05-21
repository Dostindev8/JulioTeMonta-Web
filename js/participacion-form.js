/**
 * participacion-form.js — Formularios Julio (40,001–45,000) y Richard (30,001–35,000)
 * Envío: WhatsApp + mailto (Richard)
 */
(function () {
  const PROCESOS = {
    richard: {
      min: 30001,
      max: 35000,
      whatsapp: '18098280554',
      email: 'richardtemonta@gmail.com',
      brand: 'RICHARD TE MONTA',
      logo: 'images/Richardlogo.PNG',
      accent: '#f5c842',
    },
    julio: {
      min: 40001,
      max: 45000,
      whatsapp: '18098280554',
      email: null,
      brand: 'JULIO TÉ MONTA',
      logo: 'images/logo.png',
      accent: '#e8386d',
    },
  };

  const RD_PHONE = /^(809|829|849)[-.\s]?\d{3}[-.\s]?\d{4}$/;

  function digitsPhone(v) {
    return (v || '').replace(/\D/g, '');
  }

  function formatBoleto(n) {
    return '# ' + Number(n).toLocaleString('en-US');
  }

  function initForm(root) {
    const proceso = root.dataset.proceso || root.dataset.participacion;
    const cfg = PROCESOS[proceso];
    if (!cfg) return;

    const form = root.querySelector('.part-form');
    const status = root.querySelector('.part-form-status');
    const btn = root.querySelector('.part-form-submit');
    const logo = root.querySelector('.part-form-logo');
    const ticketWrap = root.querySelector('[data-ticket-selector]');

    if (logo) logo.src = cfg.logo;
    if (ticketWrap) {
      ticketWrap.dataset.min = cfg.min;
      ticketWrap.dataset.max = cfg.max;
    }
    root.style.setProperty('--part-accent', cfg.accent);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (root.querySelector('.part-honeypot')?.value) return;

      const nombre = form.nombre.value.trim();
      const apellido = form.apellido.value.trim();
      const telefono = form.telefono.value.trim();
      const direccion = form.direccion.value.trim();
      const vendedor = form.vendedor?.value.trim() || 'N/A';
      const boleto = parseInt(form.boleto.value, 10);
      const file = form.comprobante.files[0];

      root.querySelectorAll('.part-field').forEach((f) => f.classList.remove('has-error'));

      let ok = true;
      const err = (name) => {
        let el = root.querySelector('[name="' + name + '"]')?.closest('.part-field');
        if (name === 'boleto' && !el) el = root.querySelector('[data-ticket-field]');
        if (el) el.classList.add('has-error');
        ok = false;
      };

      if (nombre.length < 2) err('nombre');
      if (apellido.length < 2) err('apellido');
      const telDigits = digitsPhone(telefono);
      if (telDigits.length !== 10 || !/^(809|829|849)/.test(telDigits)) err('telefono');
      if (direccion.length < 5) err('direccion');
      if (!form.boleto?.value || isNaN(boleto) || boleto < cfg.min || boleto > cfg.max) err('boleto');
      if (!file) err('comprobante');

      if (!ok) {
        showStatus(status, 'error', 'Revisa los campos marcados e intenta de nuevo.');
        return;
      }

      btn.disabled = true;
      btn.classList.add('loading');
      showStatus(status, '', '');

      const id = 'JTM-' + Date.now().toString(36).toUpperCase();
      const ts = new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' });

      const waMsg =
        '🎟 *' + cfg.brand + ' — PARTICIPACIÓN*\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📋 *ID:* ' + id + '\n' +
        '👤 *Nombre:* ' + nombre + ' ' + apellido + '\n' +
        '📱 *Teléfono:* ' + telefono + '\n' +
        '📍 *Dirección:* ' + direccion + '\n' +
        '🎫 *Boleto:* ' + formatBoleto(boleto) + '\n' +
        '🤝 *Vendedor:* ' + vendedor + '\n' +
        '📎 *Comprobante:* ' + file.name + ' (adjuntar en el chat)\n' +
        '🕐 *Fecha:* ' + ts + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '_Confirma tu pago adjuntando el comprobante en este chat._';

      const waUrl = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(waMsg);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      showStatus(
        status,
        'success',
        '¡Participación registrada! Abre WhatsApp y adjunta tu comprobante. ID: ' + id
      );
      form.reset();
      btn.disabled = false;
      btn.classList.remove('loading');
    });
  }

  function showStatus(el, type, msg) {
    if (!el) return;
    el.className = 'part-form-status' + (type ? ' is-' + type : '');
    el.textContent = msg;
    el.hidden = !msg;
  }

  document.querySelectorAll('[data-participacion]').forEach(initForm);
})();
