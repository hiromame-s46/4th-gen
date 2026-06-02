const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('[data-section]')];
let currentFilter = 'all';
let isProgrammaticScroll = false;

function visibleSections() {
  return sections.filter((section) => !section.hidden);
}

function setActiveTab(filter) {
  filterButtons.forEach((item) => {
    const isActive = item.dataset.filter === filter;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });

  const activeButton = filterButtons.find((item) => item.dataset.filter === filter);
  activeButton?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function scrollToSection(filter) {
  const target = filter === 'all'
    ? document.querySelector('[data-section]')
    : visibleSections()[0];

  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    isProgrammaticScroll = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      isProgrammaticScroll = false;
    }, 520);
  });
}

function applyFilter(filter, shouldScroll = false) {
  currentFilter = filter;
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

  if (shouldScroll) {
    scrollToSection(filter);
  }
}

const sectionObserver = new IntersectionObserver((entries) => {
  if (isProgrammaticScroll) {
    return;
  }

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
  rootMargin: '-34% 0px -48% 0px',
  threshold: [0.18, 0.32, 0.5, 0.7],
});

sections.forEach((section) => {
  sectionObserver.observe(section);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyFilter(button.dataset.filter, true);
  });
});

applyFilter('all');
