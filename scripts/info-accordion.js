document.querySelectorAll('.acc-trigger').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.acc-item');
    const panel = item.querySelector('.acc-panel');

    if (item.classList.contains('is-open')) {
      panel.style.maxHeight = null;
      item.classList.remove('is-open');
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      item.classList.add('is-open');
    }
  });
});