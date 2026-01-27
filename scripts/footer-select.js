(function initCurrencySelect() {
  const root = document.querySelector('[data-currency]');
  if (!root) return;

  const btn = root.querySelector('.currency-select__btn');
  const menu = root.querySelector('.currency-select__menu');
  const valueEl = root.querySelector('[data-currency-value]');
  const opts = Array.from(root.querySelectorAll('.currency-select__opt'));

  const open = () => {
    root.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');

    // фокус в меню (Safari ок)
    menu.focus({ preventScroll: true });

    // подтянуть скролл к выбранному
    const selected = root.querySelector('.currency-select__opt.is-selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  };

  const close = () => {
    root.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  };

  const toggle = () => {
    root.classList.contains('is-open') ? close() : open();
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // клик вне
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) close();
  });

  // esc закрыть
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // выбор
  opts.forEach((opt) => {
    opt.addEventListener('click', () => {
      const v = opt.dataset.value ?? opt.textContent.trim();

      opts.forEach(o => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });

      opt.classList.add('is-selected');
      opt.setAttribute('aria-selected', 'true');

      valueEl.textContent = v;

      close();
      btn.focus();
    });
  });
})();