// CONFIGURATION
const CONFIG = {
  whatsappNumber: '18098280554', // NÚMERO DE WHATSAPP (ACTUALIZAR)
  instagram: 'https://www.instagram.com/juliotemontaoficial/',
  loaderDuration: 3800,
  
  rifas: [
    {
      id: 'r1',
      emoji: '🚗',
      badge: '🔥 HOT',
      titulo: 'Toyota Corolla 2023',
      precio: 'RD$500',
      precioNum: 500,
      descripcion: 'Carro en perfectas condiciones, 0 km, color negro metálico.',
      pct: 78,
      fecha: '30 Junio 2026',
    },
    {
      id: 'r2',
      emoji: '💰',
      badge: '⚡ NUEVO',
      titulo: 'RD$200,000 en Efectivo',
      precio: 'RD$200',
      precioNum: 200,
      descripcion: 'Doscientos mil pesos en efectivo entregados el día del sorteo.',
      pct: 45,
      fecha: '15 Julio 2026',
    },
    {
      id: 'r3',
      emoji: '🏍️',
      badge: '🌟 POPULAR',
      titulo: 'Moto Honda CB500F',
      precio: 'RD$150',
      precioNum: 150,
      descripcion: 'Moto sport nueva, color rojo, documentos y primer seguro incluido.',
      pct: 91,
      fecha: '5 Junio 2026',
    },
  ],

  ganadores: [
    { iniciales:'JR', nombre:'José Rodríguez', premio:'Toyota Hilux 2022', fecha:'Enero 2026', boleto:'#0047' },
    { iniciales:'ML', nombre:'María López', premio:'RD$100,000 en Efectivo', fecha:'Febrero 2026', boleto:'#0231' },
    { iniciales:'CP', nombre:'Carlos Pérez', premio:'Honda Civic 2021', fecha:'Diciembre 2025', boleto:'#0189' },
    { iniciales:'AS', nombre:'Ana Sánchez', premio:'RD$50,000', fecha:'Noviembre 2025', boleto:'#0502' },
    { iniciales:'RM', nombre:'Roberto M.', premio:'Motoreta Super Gato', fecha:'Octubre 2025', boleto:'#0310' },
    { iniciales:'LP', nombre:'Luis Polanco', premio:'iPhone 15 Pro Max', fecha:'Septiembre 2025', boleto:'#0111' },
  ]
};

// Loading Screen Logic
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loader-bar');
  const pct = document.getElementById('loader-pct');
  
  let progress = 0;
  const interval = 30; // ms
  const totalSteps = CONFIG.loaderDuration / interval;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    progress = Math.min(100, (step / totalSteps) * 100);
    bar.style.width = progress + '%';
    pct.innerText = Math.floor(progress) + '%';
    
    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        loader.classList.add('hide');
      }, 200);
    }
  }, interval);

  renderRifas();
  renderGanadores();
  populateRifasSelect();
  initMobileMenu();
  initNavbarScroll();
});

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const links = document.querySelectorAll('.nav-link-mobile');

  hamburger.addEventListener('click', () => {
    drawer.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  });
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(8,8,8,0.98)';
      navbar.style.padding = '0';
    } else {
      navbar.style.background = 'rgba(8,8,8,0.88)';
      navbar.style.padding = '0';
    }
  });
}

function renderRifas() {
  const container = document.getElementById('rifas-container');
  if(!container) return;
  container.innerHTML = '';

  CONFIG.rifas.forEach((rifa, idx) => {
    container.innerHTML += `
      <div class="rifa-card animate-up" style="transition-delay: ${idx * 0.1}s">
        <div class="rifa-img-area float-anim">
          ${rifa.emoji}
          <div class="rifa-badge">${rifa.badge}</div>
        </div>
        <div class="rifa-body">
          <h3 class="rifa-title">${rifa.titulo}</h3>
          <div class="rifa-price">${rifa.precio} / Boleto</div>
          <p class="rifa-desc">${rifa.descripcion}</p>
          
          <div class="rifa-progress-container">
            <div class="rifa-progress-stats">
              <span>Vendidos</span>
              <span>${rifa.pct}%</span>
            </div>
            <div class="rifa-progress-bar">
              <div class="rifa-progress-fill js-progress" data-width="${rifa.pct}%"></div>
            </div>
            <div class="rifa-progress-stats" style="margin-top: 4px; color: var(--chrome-dark)">
              <span>Sorteo: ${rifa.fecha}</span>
            </div>
          </div>
          
          <button class="btn btn-outline btn-full" onclick="openTicketPage('${rifa.id}')">Participar →</button>
        </div>
      </div>
    `;
  });
}

function renderGanadores() {
  const container = document.getElementById('ganadores-container');
  if(!container) return;
  container.innerHTML = '';

  CONFIG.ganadores.forEach((g, idx) => {
    container.innerHTML += `
      <div class="ganador-card animate-up" style="transition-delay: ${(idx % 3) * 0.1}s">
        <div class="g-avatar">${g.iniciales}</div>
        <div class="g-info">
          <h4>${g.nombre}</h4>
          <div class="g-premio">${g.premio}</div>
          <div class="g-fecha">${g.fecha} • ${g.boleto}</div>
        </div>
        <div class="g-trofeo">🥇</div>
      </div>
    `;
  });
}
