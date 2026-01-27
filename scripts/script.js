const burgerButton = document.querySelector(".burger-button");
const sideMenu = document.querySelector(".side-menu");
const overlay = document.querySelector("[data-menu-overlay]");

const openMenu = () => {
  sideMenu.classList.add("is-open");
  overlay.classList.add("is-open");
  burgerButton.classList.add("is-open");
  burgerButton.setAttribute("aria-expanded", "true");
  sideMenu.setAttribute("aria-hidden", "false");
};

const closeMenu = () => {
  sideMenu.classList.remove("is-open");
  overlay.classList.remove("is-open");
  burgerButton.classList.remove("is-open");
  burgerButton.setAttribute("aria-expanded", "false");
  sideMenu.setAttribute("aria-hidden", "true");
};

const toggleMenu = () => {
  if (sideMenu.classList.contains("is-open")) {
    closeMenu();
    return;
  }
  openMenu();
};

burgerButton?.addEventListener("click", toggleMenu);
overlay?.addEventListener("click", closeMenu);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});