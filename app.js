const EVENT_DATES = ['2026-06-02', '2026-06-03'];

const WEATHER_CODES = {
  110: '晴れ時々くもり',
  200: 'くもり',
  203: 'くもり時々雨',
  214: 'くもり後雨',
  300: '雨',
  306: '大雨',
  308: '雨時々くもり',
};

const OFFICIAL_LINKS = [
  ['気象庁 台風', 'https://www.jma.go.jp/bosai/map.html#contents=typhoon'],
  ['雨雲', 'https://www.jma.go.jp/bosai/nowc/#zoom:10/lat:35.686/lon:139.991/colordepth:normal/elements:hrpns'],
  ['今後の雨', 'https://www.jma.go.jp/bosai/kaikotan/#zoom:9/lat:35.686/lon:139.991/colordepth:normal/elements:rasrf'],
  ['警報', 'https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=1220400&lang=ja'],
  ['JR東日本', 'https://traininfo.jreast.co.jp/train_info/kanto.aspx'],
  ['京成電鉄', 'https://www.keisei.co.jp/'],
  ['羽田空港', 'https://www.tokyo-haneda.com/flight/dms_cancel_delay.html'],
  ['成田空港', 'https://www.narita-airport.jp/ja/flight/'],
];

const FALLBACK_TRANSPORT = [
  ['JR東日本', ['京葉線', '武蔵野線', '総武快速線', '成田線'], 'https://traininfo.jreast.co.jp/train_info/kanto.aspx'],
  ['京成電鉄', ['京成本線', '成田スカイアクセス'], 'https://www.keisei.co.jp/'],
  ['京急線', ['京急空港線', '京急本線'], 'https://unkou.keikyu.co.jp/index.html'],
  ['東京モノレール', ['羽田空港線'], 'https://www.tokyo-monorail.co.jp/'],
];

const state = {
  typhoon: null,
  forecast: null,
  transport: null,
  cacheBuster: '',
  loading: false,
};

document.addEventListener('DOMContentLoaded', () => {
  setupHeroSwipe();
  renderOfficialLinks();
  document.getElementById('refresh-button').addEventListener('click', () => refreshAll(true));
  refreshAll(false);
  setInterval(() => refreshAll(false), 5 * 60 * 1000);
});

function setupHeroSwipe() {
  const deck = document.getElementById('hero-deck');
  const buttons = [...document.querySelectorAll('.hero-tabs button')];

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.hero);
      deck.scrollTo({ left: deck.clientWidth * index, behavior: 'smooth' });
      setActiveHero(index);
    });
  });

  let frame = 0;
  deck.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      setActiveHero(Math.round(deck.scrollLeft / deck.clientWidth));
    });
  }, { passive: true });
}

function setActiveHero(index) {
  document.querySelectorAll('.hero-tabs button').forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === index);
  });
}

async function refreshAll(force) {
  if (state.loading) return;
  state.loading = true;
  state.cacheBuster = `?t=${Date.now()}`;
  setRefreshState(force ? '更新中' : '読込中');

  try {
    const [typhoon, forecast, transport] = await Promise.all([
      fetchJson(cacheUrl('cache/typhoon.json')).catch(() => ({ items: [] })),
      fetchJson(cacheUrl('cache/forecast.json')),
      fetchJson(cacheUrl('cache/transport.json')),
    ]);

    state.typhoon = typhoon;
    state.forecast = forecast;
    state.transport = transport;
    renderTyphoon();
    renderWeather();
    renderTransport();
    setRefreshState(`更新 ${formatTime(new Date())}`);
  } catch (error) {
    setRefreshState('取得エラー');
  } finally {
    state.loading = false;
  }
}

function renderTyphoon() {
  const item = state.typhoon?.items?.[0];
  const analysis = item?.analysis || {};
  const day2 = item?.eventForecasts?.['2026-06-02'];
  const day3 = item?.eventForecasts?.['2026-06-03'];
  const name = [item?.category, item?.name].filter(Boolean).join(' ');

  document.getElementById('hero-typhoon-title').textContent = name || item?.title || '台風情報は公式確認';
  document.getElementById('hero-typhoon-note').textContent = item
    ? `${formatDateTime(item.issue || item.reportDatetime)} 気象庁発表`
    : '気象庁の発表を確認してください。';

  document.getElementById('hero-typhoon-metrics').innerHTML = [
    heroMetric('現在地', analysis.location || '--'),
    heroMetric('気圧', analysis.pressure ? `${analysis.pressure}hPa` : '--'),
    heroMetric('最大瞬間', analysis.gust ? `${analysis.gust}m/s` : '--'),
    heroMetric('6/3付近', day3?.location || day2?.location || '--'),
  ].join('');
}

function renderWeather() {
  const day2 = getForecastForDate('2026-06-02');
  const day3 = getForecastForDate('2026-06-03');
  renderHeroDay('day2', day2);
  renderHeroDay('day3', day3);
  renderDayCard('day2-card', '6/2 初日', day2);
  renderDayCard('day3-card', '6/3 2日目', day3);
}

function renderHeroDay(key, day) {
  const lead = document.getElementById(`hero-${key}-lead`);
  const metrics = document.getElementById(`hero-${key}-metrics`);
  if (!day) {
    lead.textContent = '予報を取得できませんでした。';
    metrics.innerHTML = '';
    return;
  }

  lead.textContent = `${day.weather || '--'} / ${decisionText(day)}`;
  metrics.innerHTML = [
    heroMetric('雨', day.pop || '--'),
    heroMetric('風', windLabel(day.wind)),
    heroMetric('波', day.wave || '--'),
    heroMetric('信頼度', day.reliability || '--'),
  ].join('');
}

function renderDayCard(id, title, day) {
  const element = document.getElementById(id);
  if (!day) {
    element.innerHTML = `<h3>${title}</h3><p class="muted">予報を取得できませんでした。</p>`;
    return;
  }

  element.innerHTML = `
    <div class="day-card__top">
      <div class="weather-icon">${smallIcon(day.weather?.includes('雨') ? 'cloud-rain' : 'wind')}</div>
      <div>
        <span>${formatShortDate(day.time)}</span>
        <h3>${title}</h3>
      </div>
    </div>
    <strong>${day.weather || '--'}</strong>
    <dl>
      <div><dt>雨</dt><dd>${day.pop || '--'}</dd></div>
      <div><dt>風</dt><dd>${day.wind || '公式確認'}</dd></div>
      <div><dt>判断</dt><dd>${decisionText(day)}</dd></div>
    </dl>
  `;
}

function renderTransport() {
  const sources = state.transport?.sources?.length ? state.transport.sources : fallbackTransport();
  const hasIssue = sources.some((source) => source.state === 'danger' || source.state === 'watch');
  const okCount = sources.filter((source) => source.state === 'ok').length;

  document.getElementById('hero-transport-title').textContent = hasIssue ? '交通は要確認' : '交通は平常表示';
  document.getElementById('hero-transport-note').textContent = hasIssue
    ? '公式ページで運休・遅延の詳細を確認してください。'
    : `${okCount}/${sources.length} 系統が平常表示です。`;
  document.getElementById('hero-transport-metrics').innerHTML = sources.slice(0, 4).map((source) => (
    heroMetric(source.name.replace(' 関東エリア', ''), source.label || '公式確認')
  )).join('');

  document.getElementById('transport-list').innerHTML = sources.map((source) => `
    <article class="transport-row">
      <div class="transport-state state-${stateClass(source.state)}">${source.label || '公式確認'}</div>
      <div class="transport-main">
        <h3>${source.name}</h3>
        <p>${source.text || '公式ページで最新情報を確認してください。'}</p>
        <div class="line-chips">${(source.lines || []).map((line) => `<span>${line}</span>`).join('')}</div>
      </div>
      <a href="${source.url}" target="_blank" rel="noreferrer">確認</a>
    </article>
  `).join('');
}

function renderOfficialLinks() {
  document.getElementById('official-links').innerHTML = OFFICIAL_LINKS.map(([label, url]) => `
    <a href="${url}" target="_blank" rel="noreferrer">${smallIcon('link')}<span>${label}</span></a>
  `).join('');
}

function getForecastForDate(date) {
  if (!Array.isArray(state.forecast) || !state.forecast.length) return null;
  const short = state.forecast[0];
  const weekly = state.forecast[1]?.timeSeries?.[0];
  const shortWeather = short.timeSeries?.[0];
  const shortPops = short.timeSeries?.[1];
  const area = shortWeather?.areas?.find((item) => item.area?.code === '120010') || shortWeather?.areas?.[0];
  const popArea = shortPops?.areas?.find((item) => item.area?.code === '120010') || shortPops?.areas?.[0];
  const weeklyArea = weekly?.areas?.find((item) => item.area?.code === '120000') || weekly?.areas?.[0];
  const shortIndex = (shortWeather?.timeDefines || []).findIndex((time) => time.startsWith(date));
  const weeklyIndex = (weekly?.timeDefines || []).findIndex((time) => time.startsWith(date));

  if (shortIndex >= 0) {
    const popByTime = new Map((shortPops?.timeDefines || []).map((time, index) => [time, popArea?.pops?.[index]]));
    return {
      date,
      time: shortWeather.timeDefines[shortIndex],
      weather: tidy(area?.weathers?.[shortIndex]),
      wind: tidy(area?.winds?.[shortIndex]),
      wave: tidy(area?.waves?.[shortIndex]),
      pop: normalizePop(popByTime.get(shortWeather.timeDefines[shortIndex]) || weeklyArea?.pops?.[weeklyIndex]),
      reliability: weeklyArea?.reliabilities?.[weeklyIndex] || '',
    };
  }

  if (weeklyIndex >= 0) {
    return {
      date,
      time: weekly.timeDefines[weeklyIndex],
      weather: WEATHER_CODES[Number(weeklyArea?.weatherCodes?.[weeklyIndex])] || '週間予報',
      wind: '',
      wave: '',
      pop: normalizePop(weeklyArea?.pops?.[weeklyIndex]),
      reliability: weeklyArea?.reliabilities?.[weeklyIndex] || '',
    };
  }

  return null;
}

function fallbackTransport() {
  return FALLBACK_TRANSPORT.map(([name, lines, url]) => ({
    name,
    lines,
    url,
    state: 'official',
    label: '公式確認',
    text: '公式ページで最新情報を確認してください。',
  }));
}

function heroMetric(label, value) {
  return `<div class="hero-metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function smallIcon(name) {
  return `<svg aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function normalizePop(value) {
  if (value === undefined || value === null || value === '') return '--';
  return `${value}%`;
}

function windLabel(wind = '') {
  if (!wind) return '公式確認';
  if (wind.includes('非常に強く') || wind.includes('強く')) return '強風注意';
  if (wind.includes('やや強く')) return 'やや強い';
  return '通常';
}

function decisionText(day) {
  if (!day) return '公式確認';
  const pop = Number(String(day.pop || '').replace('%', ''));
  if ((day.weather || '').includes('雨') && pop >= 60) return '雨具必須';
  if ((day.weather || '').includes('雨')) return '雨具推奨';
  if (windLabel(day.wind).includes('強')) return '風に注意';
  return '通常確認';
}

function stateClass(value) {
  if (value === 'danger') return 'danger';
  if (value === 'watch' || value === 'official') return 'watch';
  return 'ok';
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function cacheUrl(path) {
  return `${path}${state.cacheBuster}`;
}

function setRefreshState(text) {
  document.getElementById('refresh-state').textContent = text;
}

function formatShortDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function tidy(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}
