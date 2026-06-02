const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('[data-section]')];
const sectionVisibility = new Map();
let activeFilter = '';

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

function syncActiveTabWithScroll() {
  const visibleSection = sections
    .filter((section) => !section.hidden)
    .map((section) => ({
      section,
      ratio: sectionVisibility.get(section) || 0,
      top: section.getBoundingClientRect().top,
    }))
    .filter((item) => item.ratio > 0)
    .sort((a, b) => {
      if (b.ratio !== a.ratio) {
        return b.ratio - a.ratio;
      }

      return Math.abs(a.top) - Math.abs(b.top);
    })[0];

  const filter = visibleSection?.section.dataset.sectionFilter;
  if (!filter) {
    return;
  }

  setActiveTab(filter);
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    sectionVisibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
  });

  syncActiveTabWithScroll();
}, {
  root: null,
  rootMargin: '-24% 0px -42% 0px',
  threshold: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
});

sections.forEach((section) => {
  sectionObserver.observe(section);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyFilter(button.dataset.filter);
  });
});

setActiveTab('rail');
