// ============================================================
// main.js — Julio Té Monta · Logic Code Spot Software Solutions
// Versión corregida: todos los bugs de GitHub Pages solucionados
// ============================================================

/* ══════════════════════════════════════
   CONFIGURACIÓN — JULIO TÉ MONTA
   Editar solo esta sección para personalizar
   ══════════════════════════════════════ */
const CONFIG = {
  boletos: { inicio: 40001, fin: 40999 },
  whatsapp: "18098280554",
  nombreRifa: "Julio Té Monta",
  precioBoletoPesos: 300,
  maxBoletosPerParticipante: 20,
  fechaSorteo: "2026-08-15",
};


// ── FIX #2: enterSite() — definido y funcional ───────────────
function enterSite() {
    const intro = document.getElementById('intro');
    if (!intro) return;

    intro.style.transition = 'opacity 0.9s ease';
    intro.style.opacity = '0';
    intro.style.pointerEvents = 'none';

    setTimeout(() => {
        intro.style.display = 'none';
        // FIX #4: Restaurar scroll del body
        document.body.style.overflow = 'auto';
        // Iniciar animaciones dependientes del scroll
        initProgress();
    }, 900);
}

// ── SNAKE LOGO ────────────────────────────────────────────────
class SnakeLogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.segments = [];
        this.count = 25;
        this.resize();
        this.init();
        this.loop();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    init() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        for (let i = 0; i < this.count; i++) {
            this.segments.push({ x: cx, y: cy });
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.segments.length; i++) {
            const s = this.segments[i];
            const prev = this.segments[i - 1];
            s.x += (prev.x - s.x) * 0.3;
            s.y += (prev.y - s.y) * 0.3;
            this.ctx.lineTo(s.x, s.y);
        }
        this.ctx.stroke();
        requestAnimationFrame(() => this.loop());
    }

    updateMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.segments[0].x = e.clientX - rect.left;
        this.segments[0].y = e.clientY - rect.top;
    }
}

// ── COUNTERS ──────────────────────────────────────────────────
function initCounters() {
    const counters = document.querySelectorAll('.count');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = parseInt(entry.target.getAttribute('data-target'), 10);
            const duration = 2000;
            const step = target / (duration / 30);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    entry.target.textContent = target;
                    clearInterval(timer);
                } else {
                    entry.target.textContent = Math.floor(current);
                }
            }, 30);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

// ── PROGRESS BARS ─────────────────────────────────────────────
function initProgress() {
    const bars = document.querySelectorAll('.js-progress');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.width = entry.target.getAttribute('data-width') || '0%';
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    bars.forEach(b => observer.observe(b));
}

// ── COUNTDOWN ─────────────────────────────────────────────────
function initCountdown() {
    const target = new Date(CONFIG.fechaSorteo + 'T20:00:00').getTime();

    // Actualizar texto de fecha de sorteo dinámicamente si existe el elemento
    const fechaTextEl = document.getElementById('sorteo-fecha-text');
    if (fechaTextEl) {
        const dateObj = new Date(CONFIG.fechaSorteo + 'T00:00:00');
        const options = { day: 'numeric', month: 'long' };
        const formattedDate = dateObj.toLocaleDateString('es-ES', options).toUpperCase();
        fechaTextEl.textContent = `PRÓXIMO GRAN SORTEO: ${formattedDate}`;
    }


    function pad(n) { return String(n).padStart(2, '0'); }

    const interval = setInterval(update, 1000);

    function update() {
        const diff = target - Date.now();

        const daysEl = document.getElementById('days');
        if (!daysEl) return;

        if (diff <= 0) {
            ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
                document.getElementById(id).textContent = '00';
            });
            clearInterval(interval);
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        document.getElementById('days').textContent = pad(d);
        document.getElementById('hours').textContent = pad(h);
        document.getElementById('minutes').textContent = pad(m);
        document.getElementById('seconds').textContent = pad(s);
    }

    update();
}

// ── FIX #3: TICKET RAIN con CSS inyectado ────────────────────
function initTicketRain() {
    const container = document.getElementById('ticket-rain-container');
    if (!container) return;

    const count = window.innerWidth < 768 ? 14 : 28;
    for (let i = 0; i < count; i++) createTicket(container);
}

function createTicket(container) {
    const ticket = document.createElement('div');
    ticket.className = 'falling-ticket';

    const startX = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const delay = Math.random() * 8;
    const w = 10 + Math.random() * 14;
    const rot = Math.random() * 360;

    ticket.style.cssText = `
        left:             ${startX}%;
        width:            ${w}px;
        height:           ${w * 0.55}px;
        animation-duration:  ${duration}s;
        animation-delay:     -${delay}s;
        --rot:            ${rot}deg;
    `;

    container.appendChild(ticket);

    ticket.addEventListener('animationiteration', () => {
        ticket.style.left = `${Math.random() * 100}%`;
    });
}

// ── NAVBAR ────────────────────────────────────────────────────
function initNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    const closeBtn = document.getElementById('closeMenuBtn');
    const itemLinks = document.querySelectorAll('.nav-item-link');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

    itemLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

    // Typing toast en logo
    const navLogo = document.getElementById('navLogo');
    const toast = document.getElementById('logoTypingToast');
    const typingText = document.getElementById('typingTextInner');
    let toastTimer;

    if (navLogo && toast && typingText) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();

            // Reset
            toast.classList.remove('show');
            typingText.style.animation = 'none';
            void toast.offsetWidth; // reflow

            // Activar
            toast.classList.add('show');
            typingText.style.animation =
                'typingAnim 1.5s steps(30, end) forwards, blinkCursor 0.75s step-end infinite';

            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
        });
    }
}

// ── MOBILE MENU HELPERS ───────────────────────────────────────
function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ── SECURITY ──────────────────────────────────────────────────
function initSecurity() {
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', e => {
        const blocked =
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
            (e.ctrlKey && ['U', 'S', 'C'].includes(e.key.toUpperCase()));

        if (blocked) { e.preventDefault(); return false; }
    });

    window.addEventListener('blur', () => { document.body.style.filter = 'blur(10px)'; });
    window.addEventListener('focus', () => { document.body.style.filter = 'none'; });
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('load', () => {
    initCounters();
    initCountdown();
    initNav();
    initSecurity();
    initTicketRain();

    // Snake sólo en desktop
    const snakeCanvas = document.getElementById('snakeCanvas');
    if (snakeCanvas) {
        if (window.innerWidth >= 768) {
            const snake = new SnakeLogo(snakeCanvas);
            window.addEventListener('mousemove', e => snake.updateMouse(e));
        } else {
            snakeCanvas.style.display = 'none';
        }
    }

    // Progress bars se activan en enterSite() para que esperen a que el intro cierre
    // Si el intro no existe (por si acaso), inicializar de todas formas
    if (!document.getElementById('intro')) {
        document.body.style.overflow = 'auto';
        initProgress();
    }
});