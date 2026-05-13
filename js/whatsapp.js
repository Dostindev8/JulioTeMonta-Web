function submitTicket() {
  // Reset errors
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
  let hasError = false;

  const name = document.getElementById('tf-name').value.trim();
  const phone = document.getElementById('tf-phone').value.trim();
  const cedula = document.getElementById('tf-cedula').value.trim();
  const rifaId = document.getElementById('tf-rifa').value;
  const qty = document.getElementById('tf-qty').value;
  const pago = document.getElementById('tf-pago').value;
  const msg = document.getElementById('tf-msg').value.trim();

  if (!name) {
    showError('err-name');
    document.getElementById('tf-name').focus();
    hasError = true;
  } else if (!phone) {
    showError('err-phone');
    document.getElementById('tf-phone').focus();
    hasError = true;
  } else if (!cedula) {
    showError('err-cedula');
    document.getElementById('tf-cedula').focus();
    hasError = true;
  } else if (!rifaId) {
    showError('err-rifa');
    document.getElementById('tf-rifa').focus();
    hasError = true;
  }

  if (hasError) return;

  const rifaData = CONFIG.rifas.find(r => r.id === rifaId);

  const textMessage = composeMessage({
    name, phone, cedula, 
    rifa: rifaData.titulo,
    total: 'RD$' + (rifaData.precioNum * parseInt(qty)).toLocaleString(),
    qty, nums: selectedNums, pago, msg,
    ticketId: currentTicketId
  });

  const encodedMsg = encodeURIComponent(textMessage);
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;
  
  window.open(waUrl, '_blank');
  closeTicketPage();
}

function showError(id) {
  document.getElementById(id).classList.add('visible');
}

function composeMessage(data) {
  return `🔑 *JULIO TÉ MONTA — RESERVA DE BOLETO*\n\n` +
    `📋 *ID:* ${data.ticketId}\n` +
    `👤 *Nombre:* ${data.name}\n` +
    `📱 *WhatsApp:* ${data.phone}\n` +
    `🪪 *Cédula/Pasaporte:* ${data.cedula}\n\n` +
    `🎟 *Rifa:* ${data.rifa}\n` +
    `🔢 *Cantidad de boletos:* ${data.qty}\n` +
    `🎯 *Números elegidos:* ${data.nums.length ? data.nums.join(', ') : 'Asignación automática'}\n` +
    `💰 *Total a pagar:* ${data.total}\n` +
    `💳 *Método de pago:* ${data.pago}\n` +
    (data.msg ? `\n💬 *Mensaje:* ${data.msg}\n` : '') +
    `\n⭐ Quiero participar. Por favor confirmar y enviar datos de pago. ¡Gracias!`;
}
