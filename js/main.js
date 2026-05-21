// main.js — Lógica general del sitio
class SnakeLogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.segments = [];
        this.count = 25;
        this.init();
        this.loop();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
    }
    init() {
        for (let i = 0; i < this.count; i++) {
            this.segments.push({ x: this.canvas.width / 2, y: this.canvas.height / 2 });
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

function initCounters() {
    const counters = document.querySelectorAll('.count');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                let current = 0;
                const duration = 2000;
                const step = target / (duration / 30);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        entry.target.innerText = target;
                        clearInterval(timer);
                    } else {
                        entry.target.innerText = Math.floor(current);
                    }
                }, 30);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function initProgress() {
    const bars = document.querySelectorAll('.js-progress');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.getAttribute('data-width');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    bars.forEach(b => observer.observe(b));
}

function initFAQ() {
    document.querySelectorAll('.faq-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

function initCountdown() {
    // Set target date to September 6, 2026, at 8:00 PM
    const nextSorteo = new Date('2026-09-06T20:00:00');
    
    function update() {
        const now = new Date().getTime();
        const diff = nextSorteo.getTime() - now;
        
        if (diff <= 0) {
            const daysEl = document.getElementById('days');
            if (daysEl) {
                daysEl.innerText = "00";
                document.getElementById('hours').innerText = "00";
                document.getElementById('minutes').innerText = "00";
                document.getElementById('seconds').innerText = "00";
            }
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        if (daysEl) {
            daysEl.innerText = d.toString().padStart(2, '0');
            document.getElementById('hours').innerText = h.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
        }
    }
    setInterval(update, 1000);
    update();
}

function initTicketRain() {
    const container = document.getElementById('ticket-rain-container');
    if (!container) return;

    const ticketCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < ticketCount; i++) {
        createTicket(container);
    }
}

function createTicket(container) {
    const ticket = document.createElement('div');
    ticket.className = 'falling-ticket';
    
    // Randomize properties
    const startX = Math.random() * 100;
    const duration = 5 + Math.random() * 10;
    const delay = Math.random() * 5;
    const size = 8 + Math.random() * 12;
    const rotation = Math.random() * 360;
    
    ticket.style.left = `${startX}%`;
    ticket.style.width = `${size}px`;
    ticket.style.height = `${size * 0.6}px`;
    ticket.style.animationDuration = `${duration}s`;
    ticket.style.animationDelay = `-${delay}s`;
    ticket.style.setProperty('--rot', `${rotation}deg`);
    
    container.appendChild(ticket);
    
    // Re-spawn when animation ends to keep it infinite
    ticket.addEventListener('animationiteration', () => {
        ticket.style.left = `${Math.random() * 100}%`;
    });
}

function initNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    const closeBtn = document.getElementById('closeMenuBtn');
    const navItemLinks = document.querySelectorAll('.nav-item-link');
    
    // Toggle Menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close Menu
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Close menu when a link is clicked
    navItemLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ── Typing Effect on Logo Click ──
    const navLogo = document.getElementById('navLogo');
    const toast = document.getElementById('logoTypingToast');
    const typingText = document.getElementById('typingTextInner');
    let typingTimeout;

    if (navLogo && toast) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset Animation
            toast.classList.remove('show');
            typingText.style.animation = 'none';
            
            // Re-trigger reflow
            void toast.offsetWidth; 
            
            // Start Animation
            toast.classList.add('show');
            typingText.style.animation = `typingAnim 1.5s steps(30, end) forwards, blinkCursor .75s step-end infinite`;
            
            // Hide after a few seconds
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        });
    }
}

// Global Menu Control
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





// ── SECURITY PROTOCOL (Anti-Copy & Anti-DevTools) ──
function initSecurity() {
    // Disable Right Click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable keyboard shortcuts
    document.addEventListener('keydown', e => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+C
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Disable PrintScreen / Blur on loss of focus
    window.addEventListener('blur', () => {
        document.body.style.filter = 'blur(10px)';
    });
    window.addEventListener('focus', () => {
        document.body.style.filter = 'none';
    });
}

window.addEventListener('load', () => {
    initCounters();
    initProgress();
    initFAQ();
    initCountdown();
    initNav();
    initSecurity();
    initTicketRain();
    
    const snakeCanvas = document.getElementById('snakeCanvas');
    if (snakeCanvas) {
        if (window.innerWidth >= 768) {
            const snake = new SnakeLogo(snakeCanvas);
            window.addEventListener('mousemove', (e) => snake.updateMouse(e));
        } else {
            snakeCanvas.style.display = 'none';
        }
    }
});
