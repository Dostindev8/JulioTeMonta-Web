(function () {
  const isRichard = /richard-te-monta/i.test(location.pathname);
  if (!isRichard) return;

  document.body.classList.add('page-richard');

  const logoImgs = document.querySelectorAll('.nav-logo img, .mobile-menu-header img');
  logoImgs.forEach((img) => {
    img.src = 'images/Richardlogo.PNG';
    img.alt = 'Richard Te Monta';
  });

  const richardLink = document.querySelector('.nav-link-richard');
  if (richardLink) richardLink.classList.add('is-active');

  const participarBtn = document.querySelector('.nav-links .btn-primary, .btn-participar-richard');
  if (participarBtn && participarBtn.tagName === 'BUTTON') {
    participarBtn.textContent = 'PARTICIPAR';
    participarBtn.classList.add('btn-participar-richard');
    participarBtn.onclick = function () {
      const f = document.getElementById('formulario-richard');
      if (f) f.scrollIntoView({ behavior: 'smooth' });
      else location.href = 'richard-te-monta.html#formulario-richard';
    };
  }
})();
