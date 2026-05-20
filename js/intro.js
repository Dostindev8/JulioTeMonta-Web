// ================================================================
//  intro.js — Background Carousel + Cinematic Sequence
//
//  Background: Rifa ↔ Civic crossfade every 4s (runs forever)
//  SEQUENCE:
//    t=0.0s  → Logo reveal
//    t=2.8s  → Logo exits → Key entrance begins
//    t=4.2s  → Key glow loop starts
//    t=4.8s  → "BIENVENIDOS A" label fades in
//    t=5.4s  → Typing: "Richard y Julio" / "Té Monta"
//    t=end   → CTA button appears
// ================================================================

class IntroSequence {
  constructor() {
    this.intro       = document.getElementById('intro');
    this.keyEl       = document.getElementById('intro-key');
    this.typingText  = document.getElementById('typing-text');
    this.cursor      = document.getElementById('typing-cursor');
    this.content     = document.querySelector('.intro-content');
    this.messageLines = ['Richard y Julio', 'Té Monta'];
    this.typingSpeed  = 85;
    this.raf         = null;
    this.nodes       = [];
    this.canvas      = null;
    this.ctx         = null;

    document.body.style.overflow = 'hidden';
  }

  // ──────────────────────────────────────────────────────────────
  //  BOOT — starts all systems
  // ──────────────────────────────────────────────────────────────
  async init() {
    this._buildCanvas();
    this._startCanvas();

    // 1. Background carousel runs independently (never stops)
    this._startBgCarousel();

    // 2. Scatter tickets for depth
    setTimeout(() => this._spawnTickets(), 600);

    // 3. Logo slide
    await this._showSlide('intro-slide-3', 2800);

    // 4. Key entrance + typing
    await this._showFinalContent();
  }

  // ──────────────────────────────────────────────────────────────
  //  BACKGROUND CAROUSEL — Rifa ↔ Civic crossfade, no buttons
  // ──────────────────────────────────────────────────────────────
  _startBgCarousel() {
    const rifa  = document.getElementById('bg-layer-rifa');
    const civic = document.getElementById('bg-layer-civic');
    if (!rifa || !civic) return;

    // Start: Rifa visible, Civic hidden
    rifa.style.opacity  = '0.38';
    civic.style.opacity = '0';

    let showingRifa = true;

    // Crossfade every 4 seconds
    setInterval(() => {
      showingRifa = !showingRifa;
      if (showingRifa) {
        rifa.style.opacity  = '0.38';
        civic.style.opacity = '0';
      } else {
        rifa.style.opacity  = '0';
        civic.style.opacity = '0.38';
      }
    }, 4000);
  }

  // ──────────────────────────────────────────────────────────────
  //  SLIDE — enter, hold, exit, resolve promise when done
  // ──────────────────────────────────────────────────────────────
  _showSlide(id, duration) {
    return new Promise(resolve => {
      const slide = document.getElementById(id);
      if (!slide) { resolve(); return; }

      // Enter
      requestAnimationFrame(() => slide.classList.add('active'));

      // Progress bar (if present)
      const bar = slide.querySelector('.slide-progress');
      if (bar) {
        bar.style.transition = `width ${duration}ms linear`;
        setTimeout(() => { bar.style.width = '100%'; }, 60);
      }

      // Exit after duration
      setTimeout(() => {
        slide.classList.add('exit');
        slide.classList.remove('active');
        // Resolve after exit animation
        setTimeout(resolve, 750);
      }, duration);
    });
  }

  // ──────────────────────────────────────────────────────────────
  //  FINAL CONTENT — Key + Label + Typing + CTA
  // ──────────────────────────────────────────────────────────────
  async _showFinalContent() {
    // Fade in the content wrapper
    this.content.classList.add('active');

    // Insert "BIENVENIDOS A" label above the key
    const label = document.createElement('div');
    label.className   = 'intro-label';
    label.textContent = 'BIENVENIDOS A';
    this.content.insertBefore(label, this.keyEl);

    // Brief pause, then show label
    await this._delay(350);
    label.classList.add('visible');

    // Key entrance
    await this._delay(600);
    this.keyEl.classList.add('key-entrance');

    // After entrance animation completes → switch to glow loop
    await this._delay(1500);
    this.keyEl.classList.remove('key-entrance');
    this.keyEl.style.opacity = '1';
    this.keyEl.classList.add('key-glow');
    this._spawnParticles();

    // Typing
    await this._delay(450);
    await this._typeText();

    // Show CTA button
    this._showCTA();
  }

  // ──────────────────────────────────────────────────────────────
  //  TYPING EFFECT
  // ──────────────────────────────────────────────────────────────
  async _typeText() {
    this.typingText.innerHTML = '';

    for (let lineIndex = 0; lineIndex < this.messageLines.length; lineIndex++) {
      const lineEl = document.createElement('span');
      lineEl.className = 'typing-line';
      if (lineIndex === 1) lineEl.classList.add('typing-line--brand');
      this.typingText.appendChild(lineEl);

      const text = this.messageLines[lineIndex];
      for (let i = 0; i <= text.length; i++) {
        lineEl.textContent = text.slice(0, i);
        await this._delay(this.typingSpeed);
      }

      if (lineIndex < this.messageLines.length - 1) {
        await this._delay(220);
      }
    }

    if (this.cursor) {
      this.cursor.style.opacity   = '0';
      this.cursor.style.animation = 'none';
    }
  }

  _showCTA() {
    const cta = document.getElementById('intro-cta');
    if (cta) {
      cta.style.opacity   = '1';
      cta.style.transform = 'translateY(0)';
    }
  }

  // ──────────────────────────────────────────────────────────────
  //  PARTICLE CANVAS — gold/red web background
  // ──────────────────────────────────────────────────────────────
  _buildCanvas() {
    this.canvas    = document.createElement('canvas');
    this.canvas.id = 'intro-canvas';
    this.intro.insertBefore(this.canvas, this.intro.firstChild);
    this.ctx = this.canvas.getContext('2d');
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._initNodes();
  }

  _initNodes() {
    const count = Math.min(60, Math.floor(
      (window.innerWidth * window.innerHeight) / 13000
    ));
    this.nodes = Array.from({ length: count }, () => ({
      x:    Math.random() * this.canvas.width,
      y:    Math.random() * this.canvas.height,
      vx:   (Math.random() - 0.5) * 0.5,
      vy:   (Math.random() - 0.5) * 0.5,
      r:    Math.random() * 1.6 + 0.8,
      gold: Math.random() > 0.3,
    }));
  }

  _startCanvas() {
    const draw = () => {
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      for (const n of this.nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > width)  n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        this.ctx.fillStyle = n.gold
          ? 'rgba(255,215,0,0.45)'
          : 'rgba(233,69,96,0.35)';
        this.ctx.fill();
      }

      const MAX = 125;
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i], b = this.nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX) {
            const alpha = (1 - d / MAX) * 0.2;
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = `rgba(255,205,50,${alpha})`;
            this.ctx.lineWidth   = 0.65;
            this.ctx.stroke();
          }
        }
      }

      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }

  // ──────────────────────────────────────────────────────────────
  //  FLOATING TICKETS (atmospheric depth)
  // ──────────────────────────────────────────────────────────────
  _spawnTickets() {
    const count = window.innerWidth < 768 ? 4 : 9;
    for (let i = 0; i < count; i++) {
      const t = document.createElement('div');
      t.className = 'ticket';
      t.style.setProperty('--rot', `${Math.random() * 360}deg`);
      t.style.left           = `${5 + Math.random() * 90}%`;
      t.style.top            = `${5 + Math.random() * 90}%`;
      t.style.animationDelay = `${Math.random() * 2}s`;
      this.intro.appendChild(t);
    }
  }

  // ──────────────────────────────────────────────────────────────
  //  BURST PARTICLES — fires when key reveals
  // ──────────────────────────────────────────────────────────────
  _spawnParticles() {
    const colours = ['#FFD700','#FFA500','#e94560','#ffffff','#FFD700'];
    for (let i = 0; i < 20; i++) {
      const p     = document.createElement('span');
      p.className = 'particle';
      const angle = (i * 18) * (Math.PI / 180);
      p.style.setProperty('--angle',    `${angle}rad`);
      p.style.setProperty('--distance', `${85 + Math.random() * 65}px`);
      p.style.background = colours[i % colours.length];
      p.style.left = '50%';
      p.style.top  = '44%';
      this.content.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  // ──────────────────────────────────────────────────────────────
  //  UTILITY
  // ──────────────────────────────────────────────────────────────
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ── BOOT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  new IntroSequence().init();
});

// ── ENTER SITE ──────────────────────────────────────────────────
function enterSite() {
  const intro = document.getElementById('intro');
  intro.classList.add('hide');
  setTimeout(() => {
    intro.style.display          = 'none';
    document.body.style.overflow = 'auto';
  }, 1000);
}
