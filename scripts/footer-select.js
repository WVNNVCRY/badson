(function initCurrencySelect() {
  const ROOT_SELECTOR = '[data-currency]';

  function extractCurrencyCode(str) {
    const m = String(str || '').match(/\(([A-Z]{3})\s/);
    return m ? m[1] : null;
  }

  function init(root) {
    if (root.dataset.inited === '1') return;
    root.dataset.inited = '1';

    const btn = root.querySelector('.currency-select__btn');
    const menu = root.querySelector('.currency-select__menu');
    const valueEl = root.querySelector('[data-currency-value]');
    const opts = Array.from(root.querySelectorAll('.currency-select__opt'));

    if (!btn || !menu || !valueEl || !opts.length) return;

    if (!menu.hasAttribute('tabindex')) menu.setAttribute('tabindex', '-1');

    const open = () => {
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');

      try { menu.focus({ preventScroll: true }); } catch { menu.focus(); }

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

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

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

        const code = extractCurrencyCode(v);
        if (code && window.Currency?.set) window.Currency.set(code);

        close();
        btn.focus();
      });
    });

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

  document.querySelectorAll(ROOT_SELECTOR).forEach(init);

  const mo = new MutationObserver(() => {
    document.querySelectorAll(ROOT_SELECTOR).forEach(init);
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
})();