document.addEventListener('click', (event) => {
  const link = event.target.closest('a.link-danger');
  if (link && !confirm('Confirma esta ação?')) {
    event.preventDefault();
  }
});

const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');
const siteHeader = document.querySelector('[data-site-header]');

if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('[data-checkout-submit]').forEach((button) => {
  button.closest('form')?.addEventListener('submit', () => {
    button.setAttribute('aria-busy', 'true');
    button.innerHTML = '<span class="loading-dot"></span> Processando';
  });
});

document
  .querySelectorAll('main > section, main > div, main > article, main > form, main > aside')
  .forEach((element, index) => {
    if (index > 0) {
      element.classList.add('reveal');
    }
  });

document
  .querySelectorAll('main .grid')
  .forEach((grid) => {
    if (grid.children.length > 1) {
      grid.classList.add('stagger-on-scroll');
    }
  });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('stagger-children');
        staggerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.stagger-on-scroll').forEach((el) => staggerObserver.observe(el));

const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const mascot = hero.querySelector('.hero-mascot');
    if (mascot) {
      mascot.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    }
  });
  hero.addEventListener('mouseleave', () => {
    const mascot = hero.querySelector('.hero-mascot');
    if (mascot) {
      mascot.style.transform = '';
    }
  });
}
