// Intersection Observer for Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger generic animate-up
        if (entry.target.classList.contains('animate-up')) {
          // Check if there is an inline delay variable and apply it via style if not already
          const delay = entry.target.style.getPropertyValue('--delay');
          if(delay) {
            entry.target.style.transitionDelay = delay;
          }
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
        
        // Trigger counters
        if (entry.target.classList.contains('stat-item')) {
          const numEl = entry.target.querySelector('.stat-number');
          if (numEl && !numEl.classList.contains('counted')) {
            numEl.classList.add('counted');
            animateCounter(numEl);
          }
        }

        // Trigger progress bars
        if (entry.target.classList.contains('rifa-card')) {
          const bar = entry.target.querySelector('.js-progress');
          if (bar) {
            setTimeout(() => {
              bar.style.width = bar.getAttribute('data-width');
            }, 300); // small delay after card enters
          }
        }
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  document.querySelectorAll('.animate-up, .stat-item, .rifa-card').forEach(el => {
    observer.observe(el);
  });

  // Initialize Canvas Animations
  initLoaderBackground();
  const snakeCanvas = document.getElementById('snakeCanvas');
  if (snakeCanvas) {
    new SnakeLogo(snakeCanvas);
  }
});

function initLoaderBackground() {
  const canvas = document.getElementById('loaderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const count = 60;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if(this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.fillStyle = 'rgba(204, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for(let i=0; i<count; i++) particles.push(new Particle());
  
  function animate() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    // Draw lines
    ctx.strokeStyle = 'rgba(204, 0, 0, 0.05)';
    ctx.lineWidth = 0.5;
    for(let i=0; i<count; i++) {
      for(let j=i+1; j<count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

class SnakeLogo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.segments = [];
    this.maxLen = 40;
    this.t = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }
  loop() {
    this.t += 0.025;
    const x = (Math.sin(this.t * 0.7) * 0.38 + 0.5) * this.W;
    const y = (Math.sin(this.t * 1.8 + 0.8) * 0.28 + 0.5) * this.H;
    this.segments.unshift({ x, y });
    if (this.segments.length > this.maxLen) this.segments.pop();
    this.ctx.clearRect(0, 0, this.W, this.H);
    for (let i = 0; i < this.segments.length - 1; i++) {
      const ratio = i / this.segments.length;
      const alpha = 1 - ratio;
      const width  = (this.maxLen - i) * 0.22;
      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(204,0,0,${alpha})`;
      this.ctx.lineWidth = width;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.shadowColor = '#CC0000';
      this.ctx.shadowBlur = 8 * alpha;
      this.ctx.moveTo(this.segments[i].x, this.segments[i].y);
      this.ctx.lineTo(this.segments[i+1].x, this.segments[i+1].y);
      this.ctx.stroke();
    }
    if (this.segments.length > 0) {
      const h = this.segments[0];
      this.ctx.beginPath();
      this.ctx.fillStyle = '#CC0000';
      this.ctx.shadowBlur = 15;
      this.ctx.arc(h.x, h.y, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(h.x + 3, h.y - 2, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    requestAnimationFrame(() => this.loop());
  }
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.innerText = target + suffix;
      clearInterval(timer);
    } else {
      el.innerText = Math.floor(current) + suffix;
    }
  }, stepTime);
}
