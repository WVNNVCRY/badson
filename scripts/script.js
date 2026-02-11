const burgerButton = document.querySelector(".burger-button");
const sideMenu = document.querySelector(".side-menu");
const overlay = document.querySelector("[data-menu-overlay]");

if (!burgerButton || !sideMenu || !overlay) {
} else {
  const FOCUSABLE_SELECTORS = `
    a[href],
    button:not([disabled]),
    input:not([disabled]),
    select:not([disabled]),
    textarea:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `;

  let lastFocusedElement = null;

  let isScrollLocked = false;
  let scrollY = 0;

  function lockScroll() {
    if (isScrollLocked) return;
    isScrollLocked = true;

    scrollY = window.scrollY || window.pageYOffset;

    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-comp", `${scrollbarW}px`);

    document.documentElement.style.overflow = "hidden";

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.paddingRight = `var(--scrollbar-comp)`;
  }

  function unlockScroll() {
    if (!isScrollLocked) return;
    isScrollLocked = false;

    document.documentElement.style.overflow = "";

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";

    window.scrollTo(0, scrollY);
  }

  function preventScroll(e) {
    if (!sideMenu.classList.contains("is-open")) return;
    e.preventDefault();
  }

  function getFocusableElements() {
    return Array.from(sideMenu.querySelectorAll(FOCUSABLE_SELECTORS))
      .filter((el) => el.offsetParent !== null);
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === sideMenu) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openMenu() {
    lastFocusedElement = document.activeElement;

    lockScroll();

    sideMenu.classList.add("is-open");
    overlay.classList.add("is-open");
    burgerButton.classList.add("is-open");

    burgerButton.setAttribute("aria-expanded", "true");
    sideMenu.setAttribute("aria-hidden", "false");

    document.addEventListener("keydown", trapFocus, true);

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
  }

  function closeMenu() {
    sideMenu.classList.remove("is-open");
    overlay.classList.remove("is-open");
    burgerButton.classList.remove("is-open");

    burgerButton.setAttribute("aria-expanded", "false");
    sideMenu.setAttribute("aria-hidden", "true");

    document.removeEventListener("keydown", trapFocus, true);

    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);

    unlockScroll();
    lastFocusedElement?.focus({ preventScroll: true });
  }

  function toggleMenu() {
    if (sideMenu.classList.contains("is-open")) closeMenu();
    else openMenu();
  }

  burgerButton.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", closeMenu);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sideMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}