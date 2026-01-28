// scripts/footer-select.js
(function initCurrencySelect() {
  const ROOT_SELECTOR = '[data-currency]';

  function extractCurrencyCode(str) {
    const m = String(str || '').match(/\(([A-Z]{3})\s/);
    return m ? m[1] : null;
  }

  function init(root) {
    // защита от повторной инициализации
    if (root.dataset.inited === '1') return;
    root.dataset.inited = '1';

    const btn = root.querySelector('.currency-select__btn');
    const menu = root.querySelector('.currency-select__menu');
    const valueEl = root.querySelector('[data-currency-value]');
    const opts = Array.from(root.querySelectorAll('.currency-select__opt'));

    if (!btn || !menu || !valueEl || !opts.length) return;

    // чтобы menu.focus() реально работал
    if (!menu.hasAttribute('tabindex')) menu.setAttribute('tabindex', '-1');

    const open = () => {
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');

      // Safari-friendly focus
      try { menu.focus({ preventScroll: true }); } catch { menu.focus(); }

      // скролл к выбранному
      const selected = root.querySelector('.currency-select__opt.is-selected');
      if (selected) {
        try { selected.scrollIntoView({ block: 'nearest' }); } catch { }
      }
    };

    const close = () => {
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    };

    const toggle = () => (root.classList.contains('is-open') ? close() : open());

    // ВАЖНО: ловим клик на btn именно на bubble фазе + stopPropagation
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // выбор опции — делаем ЖБ: снимаем со всех, ставим одной
    opts.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const v = opt.dataset.value ?? opt.textContent.trim();

        opts.forEach((o) => {
          o.classList.remove('is-selected');
          o.setAttribute('aria-selected', 'false');
        });

        opt.classList.add('is-selected');
        opt.setAttribute('aria-selected', 'true');

        valueEl.textContent = v;

        // если подключён currency.js — меняем валюту
        const code = extractCurrencyCode(v);
        if (code && window.Currency?.set) window.Currency.set(code);

        close();
        btn.focus();
      });
    });

    // клик вне (capture, чтобы нас не “перехватывали” другие обработчики)
    document.addEventListener(
      'click',
      (e) => {
        if (!root.contains(e.target)) close();
      },
      true
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // 1) обычная инициализация
  document.querySelectorAll(ROOT_SELECTOR).forEach(init);

  // 2) если на product-page футер/селект появляется позже — подстрахуем MutationObserver
  const mo = new MutationObserver(() => {
    document.querySelectorAll(ROOT_SELECTOR).forEach(init);
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
})();