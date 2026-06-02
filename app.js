const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('[data-section]')];

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });

    cards.forEach((card) => {
      const categories = card.dataset.category.split(/\s+/);
      const shouldShow = filter === 'all' || categories.includes(filter);
      card.toggleAttribute('hidden', !shouldShow);
    });

    sections.forEach((section) => {
      const hasVisibleCard = [...section.querySelectorAll('[data-category]')].some((card) => !card.hidden);
      section.toggleAttribute('hidden', !hasVisibleCard);
    });
  });
});
