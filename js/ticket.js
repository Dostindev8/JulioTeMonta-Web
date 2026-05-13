let selectedNums = [];
let currentTicketId = '';

function populateRifasSelect() {
  const select = document.getElementById('tf-rifa');
  if(!select) return;
  CONFIG.rifas.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.titulo} - ${r.precio}`;
    select.appendChild(opt);
  });
}

function openTicketPage(rifaId = '') {
  const modal = document.getElementById('ticket-modal');
  modal.classList.remove('hide');
  document.body.style.overflow = 'hidden'; // Prevent bg scrolling
  
  // Reset Form
  document.getElementById('ticket-form').reset();
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
  
  // Set Ticket ID
  currentTicketId = 'JTM-' + Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('pv-id').innerText = currentTicketId;
  
  // Pre-select rifa if provided
  if (rifaId) {
    document.getElementById('tf-rifa').value = rifaId;
  }
  
  // Initialize Numbers
  initNumbersPicker();
  selectedNums = [];
  
  updatePreview();
}

function closeTicketPage() {
  const modal = document.getElementById('ticket-modal');
  modal.classList.add('hide');
  document.body.style.overflow = 'auto';
}

function initNumbersPicker() {
  const container = document.getElementById('numbers-picker');
  if(!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 50; i++) {
    const numStr = i.toString().padStart(2, '0');
    const btn = document.createElement('div');
    btn.className = 'num-btn';
    btn.innerText = numStr;
    btn.onclick = () => toggleNumber(btn, numStr);
    container.appendChild(btn);
  }
}

function toggleNumber(btn, num) {
  if (selectedNums.includes(num)) {
    selectedNums = selectedNums.filter(n => n !== num);
    btn.classList.remove('selected');
  } else {
    if (selectedNums.length >= 3) {
      // UX visual feedback instead of alert
      btn.style.animation = 'pulseRed 0.3s ease';
      setTimeout(()=> btn.style.animation = '', 300);
      return;
    }
    selectedNums.push(num);
    btn.classList.add('selected');
  }
  updatePreview();
}

// Live Update Preview
document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['tf-name', 'tf-rifa', 'tf-qty'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });
});

function updatePreview() {
  const name = document.getElementById('tf-name').value || '--';
  const rifaSelect = document.getElementById('tf-rifa');
  const qty = parseInt(document.getElementById('tf-qty').value) || 1;
  
  document.getElementById('pv-name').innerText = name;
  document.getElementById('pv-qty').innerText = qty;
  
  if (selectedNums.length > 0) {
    document.getElementById('pv-nums').innerText = selectedNums.join(', ');
  } else {
    document.getElementById('pv-nums').innerText = 'Automático';
  }
  
  if (rifaSelect && rifaSelect.value) {
    const rifaData = CONFIG.rifas.find(r => r.id === rifaSelect.value);
    document.getElementById('pv-rifa').innerText = rifaData.titulo;
    document.getElementById('pv-total').innerText = 'RD$' + (rifaData.precioNum * qty).toLocaleString();
  } else {
    document.getElementById('pv-rifa').innerText = '--';
    document.getElementById('pv-total').innerText = '--';
  }
}
