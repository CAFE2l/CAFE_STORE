document.querySelectorAll('.cart-item input[type="number"]').forEach((input) => {
  input.addEventListener('change', () => input.closest('form').submit());
});
