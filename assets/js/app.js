document.addEventListener('click', (event) => {
  const link = event.target.closest('a.link-danger');
  if (link && !confirm('Confirma esta ação?')) {
    event.preventDefault();
  }
});

const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('[data-checkout-submit]').forEach((button) => {
  button.closest('form')?.addEventListener('submit', () => {
    button.setAttribute('aria-busy', 'true');
    button.innerHTML = '<span class="loading-dot"></span> Processando';
  });
});
