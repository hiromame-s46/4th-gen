const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];

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
  });
});
