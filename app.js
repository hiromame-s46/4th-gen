const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('[data-section]')];
let currentFilter = 'all';
let activeFilter = 'all';

function setActiveTab(filter) {
  if (activeFilter === filter) {
    return;
  }

  activeFilter = filter;

  filterButtons.forEach((item) => {
    const isActive = item.dataset.filter === filter;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  activeFilter = '';
  setActiveTab(filter);

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

const sectionObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries
    .filter((entry) => entry.isIntersecting && !entry.target.hidden)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  const filter = visibleEntry?.target.dataset.sectionFilter;
  if (!filter || currentFilter !== 'all') {
    return;
  }

  setActiveTab(filter);
}, {
  root: null,
  rootMargin: '-38% 0px -46% 0px',
  threshold: [0.35, 0.55],
});

sections.forEach((section) => {
  sectionObserver.observe(section);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyFilter(button.dataset.filter);
  });
});

applyFilter('all');
