const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('[data-section]')];

function applyFilter(filter) {
  filterButtons.forEach((item) => {
    item.classList.toggle('is-active', item.dataset.filter === filter);
    item.setAttribute('aria-pressed', String(item.dataset.filter === filter));
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
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyFilter(button.dataset.filter);
  });
});

applyFilter('all');
