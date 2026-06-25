document.addEventListener('DOMContentLoaded', () => {
  const popover = document.querySelector('.policy-popover');
  const trigger = popover?.querySelector('.policy-popover__trigger');

  if (!popover || !trigger) return;

  const closePopover = () => {
    popover.open = false;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.blur();
  };

  trigger.setAttribute('aria-expanded', popover.open ? 'true' : 'false');

  popover.addEventListener('toggle', () => {
    trigger.setAttribute('aria-expanded', popover.open ? 'true' : 'false');

    if (popover.open) {
      window.requestAnimationFrame(() => trigger.blur());
    } else {
      trigger.blur();
    }
  });

  document.addEventListener('click', (event) => {
    if (!popover.open || !(event.target instanceof Node)) return;
    if (!popover.contains(event.target)) {
      closePopover();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popover.open) {
      closePopover();
    }
  });
});
