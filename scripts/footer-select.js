(function currencySelectBoot() {
  const ROOT_SELECTOR = "[data-currency]";
  const STORAGE_KEY = "currency_value";

  function extractCurrencyCode(str) {
    const m = String(str || "").match(/\(([A-Z]{3})\s/);
    return m ? m[1] : null;
  }

  function getOptText(opt) {
    return (opt.dataset.value ?? opt.textContent.trim()).trim();
  }

  function clearAllSelected(root) {
    root.querySelectorAll(".currency-select__opt").forEach((o) => {
      o.classList.remove("is-selected");
      o.setAttribute("aria-selected", "false");
    });
  }

  function setSelected(root, opt) {
    clearAllSelected(root);
    opt.classList.add("is-selected");
    opt.setAttribute("aria-selected", "true");

    const valueEl = root.querySelector("[data-currency-value]");
    if (valueEl) valueEl.textContent = getOptText(opt);
  }

  function selectByValue(root, valueText) {
    const opts = Array.from(root.querySelectorAll(".currency-select__opt"));
    const found = opts.find((o) => getOptText(o) === valueText);
    if (found) setSelected(root, found);
  }

  function cleanupSelected(root) {
    const opts = Array.from(root.querySelectorAll(".currency-select__opt"));
    const selected = opts.filter((o) => o.classList.contains("is-selected"));

    // если выделено больше одного — оставляем только первый
    if (selected.length > 1) {
      setSelected(root, selected[0]);
    }
  }

  function initOne(root) {
    if (!root) return;
    if (root.dataset.inited === "1") return;
    root.dataset.inited = "1";

    const btn = root.querySelector(".currency-select__btn");
    const menu = root.querySelector(".currency-select__menu");
    const valueEl = root.querySelector("[data-currency-value]");
    const opts = Array.from(root.querySelectorAll(".currency-select__opt"));
    if (!btn || !menu || !valueEl || !opts.length) return;

    if (!menu.hasAttribute("tabindex")) menu.setAttribute("tabindex", "-1");

    // === restore (по уникальному value) ===
    const savedValue = localStorage.getItem(STORAGE_KEY);
    if (savedValue) {
      selectByValue(root, savedValue);
      const code = extractCurrencyCode(savedValue);
      if (code && window.Currency?.set) window.Currency.set(code);
    } else {
      // если ничего не сохранено — синхроним с текущим текстом кнопки
      const currentText = (valueEl.textContent || "").trim();
      if (currentText) {
        selectByValue(root, currentText);
        const code = extractCurrencyCode(currentText);
        if (code && window.Currency?.set) window.Currency.set(code);
      }
    }

    // 💣 анти-баг: если другой скрипт пометил несколько — почистим
    cleanupSelected(root);

    const open = () => {
      root.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");

      try { menu.focus({ preventScroll: true }); } catch { try { menu.focus(); } catch { } }

      const selected = root.querySelector(".currency-select__opt.is-selected");
      if (selected) {
        try { selected.scrollIntoView({ block: "nearest" }); } catch { }
      }
    };

    const close = () => {
      root.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      root.classList.contains("is-open") ? close() : open();
    });

    // choose option
    opts.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSelected(root, opt);

        const text = getOptText(opt);
        localStorage.setItem(STORAGE_KEY, text);

        const code = extractCurrencyCode(text);
        if (code && window.Currency?.set) window.Currency.set(code);

        // и ещё раз почистим, если вдруг Currency.set что-то трогает
        cleanupSelected(root);

        close();
        btn.focus();
      });
    });

    // click outside (capture)
    document.addEventListener(
      "click",
      (e) => {
        if (!root.contains(e.target)) close();
      },
      true
    );

    // esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initAll() {
    document.querySelectorAll(ROOT_SELECTOR).forEach((root) => {
      initOne(root);
      // на всякий случай чистим при каждом проходе
      cleanupSelected(root);
    });
  }

  initAll();

  // если футер/опции дорендериваются — переинициализируем
  const mo = new MutationObserver(() => initAll());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();