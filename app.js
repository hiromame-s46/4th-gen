const EVENT_DATES = ['2026-06-02', '2026-06-03'];

const WEATHER_CODES = {
  100: '晴れ',
  101: '晴れ時々くもり',
  110: '晴れ時々くもり',
  111: '晴れ時々くもり',
  200: 'くもり',
  201: 'くもり時々晴れ',
  203: 'くもり時々雨',
  204: 'くもり一時雨',
  214: 'くもり後雨',
  300: '雨',
  301: '雨時々晴れ',
  302: '雨時々止む',
  306: '大雨',
  308: '雨時々くもり',
  400: '雪',
};

const WARNING_NAMES = {
  '02': '暴風雪警報',
  '03': '大雨警報',
  '04': '洪水警報',
  '05': '暴風警報',
  '06': '大雪警報',
  '07': '波浪警報',
  '08': '高潮警報',
  '10': '大雨注意報',
  '12': '大雪注意報',
  '13': '風雪注意報',
  '14': '雷注意報',
  '15': '強風注意報',
  '16': '波浪注意報',
  '18': '洪水注意報',
  '19': '高潮注意報',
  '20': '濃霧注意報',
  '21': '乾燥注意報',
  '23': '低温注意報',
  '32': '暴風雪特別警報',
  '33': '大雨特別警報',
  '35': '暴風特別警報',
  '36': '大雪特別警報',
  '37': '波浪特別警報',
  '38': '高潮特別警報',
};

const RAIL_SOURCES = [
  ['JR東日本', ['京葉線', '武蔵野線', '総武快速線', '成田線'], 'https://traininfo.jreast.co.jp/train_info/kanto.aspx'],
  ['京成電鉄', ['京成本線', '成田スカイアクセス', '押上線'], 'https://www.keisei.co.jp/'],
  ['京急線', ['京急空港線', '京急本線'], 'https://unkou.keikyu.co.jp/index.html'],
  ['東京モノレール', ['羽田空港線'], 'https://www.tokyo-monorail.co.jp/'],
];

const ROUTES = [
  {
    title: '東京・新木場方面',
    body: '京葉線で南船橋へ。強風時は総武線と京成本線も確認。',
    links: [['JR東日本', 'https://traininfo.jreast.co.jp/train_info/kanto.aspx']],
  },
  {
    title: '羽田空港から',
    body: '京急または東京モノレールで都心へ出て、JR京葉線または京成本線へ接続。',
    links: [
      ['京急', 'https://unkou.keikyu.co.jp/index.html'],
      ['東京モノレール', 'https://www.tokyo-monorail.co.jp/'],
    ],
  },
  {
    title: '成田空港から',
    body: '京成本線と成田スカイアクセスを確認。JR利用時は成田線と総武快速線も見る。',
    links: [
      ['京成電鉄', 'https://www.keisei.co.jp/'],
      ['成田空港アクセス', 'https://www.narita-airport.jp/ja/access/train/'],
    ],
  },
];

const FLIGHT_CARDS = [
  {
    title: '羽田空港',
    body: '国内線・国際線の遅延、欠航、出発到着。',
    links: [
      ['国内線', 'https://www.tokyo-haneda.com/flight/dms_cancel_delay.html'],
      ['国際線', 'https://www.tokyo-haneda.com/flight/int_cancel_delay.html'],
    ],
  },
  {
    title: '成田空港',
    body: '出発・到着フライト、航空会社、ターミナル。',
    links: [['フライト情報', 'https://www.narita-airport.jp/ja/flight/']],
  },
  {
    title: '航空会社',
    body: '遠征便は空港ページと航空会社ページを両方確認。',
    links: [
      ['ANA', 'https://www.ana.co.jp/fs/dom/jp/'],
      ['JAL', 'https://www.jal.co.jp/jp/ja/other/weather_info_dom/'],
    ],
  },
];

const EVACUATION_LINKS = [
  ['船橋市 防災ポータル', '避難情報・防災無線・河川水位', 'https://www.city.funabashi.lg.jp/bousai/index.html'],
  ['会場周辺の避難場所', '浜町周辺の避難場所を確認', 'https://www.city.funabashi.lg.jp/bousai/search/index.html'],
  ['千葉県 防災ポータル', '県内避難情報・被害情報', 'https://www.bousai.pref.chiba.lg.jp/'],
  ['Yahoo!避難情報', 'Lアラート由来の避難情報', 'https://crisis.yahoo.co.jp/evacuation/12/12204/'],
];

const SOURCES = [
  ['櫻坂46公式 公演情報', 'https://sakurazaka46.com/s/s46/news/detail/E00637?ima=0000&link=ROBO004'],
  ['LaLa arena TOKYO-BAY アクセス', 'https://lalaarenatokyo-bay.com/access/'],
  ['気象庁 台風情報', 'https://www.jma.go.jp/bosai/map.html#contents=typhoon'],
  ['気象庁 会場周辺の警報・注意報', 'https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=1220400&lang=ja'],
  ['気象庁 雨雲の動き', 'https://www.jma.go.jp/bosai/nowc/#zoom:10/lat:35.686/lon:139.991/colordepth:normal/elements:hrpns'],
  ['JR東日本 運行情報', 'https://traininfo.jreast.co.jp/train_info/kanto.aspx'],
  ['京成電鉄 運行情報', 'https://www.keisei.co.jp/'],
  ['羽田空港 遅延欠航', 'https://www.tokyo-haneda.com/flight/dms_cancel_delay.html'],
  ['成田空港 フライト情報', 'https://www.narita-airport.jp/ja/flight/'],
];

const state = {
  typhoon: null,
  warning: null,
  forecast: null,
  transport: null,
  cacheBuster: '',
  loading: false,
};

document.addEventListener('DOMContentLoaded', () => {
  renderStatic();
  setupTabs();
  document.getElementById('refresh-button').addEventListener('click', () => refreshAll(true));
  refreshAll(false);
  setInterval(() => refreshAll(false), 5 * 60 * 1000);
});

function renderStatic() {
  document.getElementById('route-panels').innerHTML = ROUTES.map((route) => `
    <article class="route-card">
      <h3>${route.title}</h3>
      <p>${route.body}</p>
      <div class="card-links">${route.links.map(([label, url]) => linkButton(label, url)).join('')}</div>
    </article>
  `).join('');

  document.getElementById('flight-grid').innerHTML = FLIGHT_CARDS.map((card) => `
    <article class="link-card">
      <h3>${card.title}</h3>
      <p>${card.body}</p>
      <div class="card-links">${card.links.map(([label, url]) => linkButton(label, url)).join('')}</div>
    </article>
  `).join('');

  document.getElementById('evacuation-summary').innerHTML = EVACUATION_LINKS.map(([label, note, url]) => `
    <a class="link-card" href="${url}" target="_blank" rel="noreferrer">
      <strong>${label}</strong>
      <span>${note}</span>
    </a>
  `).join('');

  document.getElementById('source-list').innerHTML = SOURCES.map(([label, url]) => `
    <div class="source-item">
      <strong>${label}</strong>
      <a href="${url}" target="_blank" rel="noreferrer">${url}</a>
    </div>
  `).join('');
}

function setupTabs() {
  const panels = document.getElementById('tab-panels');
  const buttons = [...document.querySelectorAll('.tab-nav button')];

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.tab);
      panels.scrollTo({ left: panels.clientWidth * index, behavior: 'smooth' });
      setActiveTab(index);
    });
  });

  let frame = 0;
  panels.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      setActiveTab(Math.round(panels.scrollLeft / panels.clientWidth));
    });
  }, { passive: true });
}

function setActiveTab(index) {
  document.querySelectorAll('.tab-nav button').forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === index);
  });
}

async function refreshAll(force) {
  if (state.loading) return;
  state.loading = true;
  state.cacheBuster = `?t=${Date.now()}`;
  setRefreshState(force ? '更新中' : '読込中');

  try {
    const [typhoon, warning, forecast, transport] = await Promise.all([
      fetchJson(cacheUrl('cache/typhoon.json')).catch(() => ({ items: [] })),
      fetchJson(cacheUrl('cache/warning.json')),
      fetchJson(cacheUrl('cache/forecast.json')),
      fetchJson(cacheUrl('cache/transport.json')),
    ]);
    state.typhoon = typhoon;
    state.warning = warning;
    state.forecast = forecast;
    state.transport = transport;
    renderTyphoon();
    renderForecast();
    renderWarnings();
    renderTransport();
    setRefreshState(`更新 ${formatTime(new Date())}`);
  } catch (error) {
    setRefreshState('取得エラー');
    renderFallback();
  } finally {
    state.loading = false;
  }
}

function renderTyphoon() {
  const item = state.typhoon?.items?.[0];
  document.getElementById('typhoon-title').textContent = item?.title || '台風情報は公式発表を確認';
  document.getElementById('typhoon-note').textContent = item
    ? `${formatDateTime(item.reportDatetime)} 発表 / 位置よりも会場周辺の雨・風・交通を優先確認`
    : '公演日周辺は天気・風・交通の変化を優先して確認してください。';
}

function renderForecast() {
  const days = getEventDays();
  const [day2, day3] = days;

  if (!day2 && !day3) {
    setTile('summary-day2', '6/2', '公式確認', '予報を取得できませんでした。', 'watch');
    setTile('summary-day3', '6/3', '公式確認', '予報を取得できませんでした。', 'watch');
    return;
  }

  renderDay('day2-panel', day2, '6/2 初日', 'day2');
  renderDay('day3-panel', day3, '6/3 2日目', 'day3');
  renderDecisionGrid(days);

  setTile('summary-day2', '6/2', day2?.weather || '確認中', `降水確率 ${day2?.pop || '--'} / ${windLabel(day2?.wind)}`, riskFromDay(day2));
  setTile('summary-day3', '6/3', day3?.weather || '確認中', `降水確率 ${day3?.pop || '--'} / ${day3?.reliability ? `信頼度 ${day3.reliability}` : '風は公式確認'}`, riskFromDay(day3));
}

function renderDay(id, day, title, key) {
  const container = document.getElementById(id);
  if (!day) {
    container.innerHTML = '<p class="muted">予報を取得できませんでした。</p>';
    return;
  }

  container.innerHTML = `
    <div class="day-summary-card">
      <div class="weather-mark">${weatherIcon(day.weather)}</div>
      <div>
        <p class="eyebrow">${formatShortDate(day.time)}</p>
        <h3>${title}</h3>
        <strong>${day.weather || '--'}</strong>
      </div>
    </div>
    <div class="metric-grid">
      ${metricCard('雨', day.pop || '--', 'cloud-rain')}
      ${metricCard('風', windLabel(day.wind), 'wind', day.wind || '詳細は気象庁を確認')}
      ${metricCard('波', day.wave || '--', 'alert')}
      ${metricCard('判断', decisionText(day), 'alert')}
    </div>
    <div class="action-list">
      ${linkButton('雨雲', 'https://www.jma.go.jp/bosai/nowc/#zoom:10/lat:35.686/lon:139.991/colordepth:normal/elements:hrpns')}
      ${linkButton('今後の雨', 'https://www.jma.go.jp/bosai/kaikotan/#zoom:9/lat:35.686/lon:139.991/colordepth:normal/elements:rasrf')}
      ${linkButton('警報', 'https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=1220400&lang=ja')}
    </div>
  `;
}

function renderDecisionGrid(days) {
  document.getElementById('top-decision-grid').innerHTML = days.map((day) => `
    <article class="decision-card">
      <span>${formatShortDate(day.time)}</span>
      <strong>${decisionText(day)}</strong>
      <p>${day.weather || '--'} / 降水確率 ${day.pop || '--'}</p>
    </article>
  `).join('');
}

function getEventDays() {
  return EVENT_DATES.map((date) => getForecastForDate(date));
}

function getForecastForDate(date) {
  if (!Array.isArray(state.forecast) || !state.forecast.length) return null;
  const short = state.forecast[0];
  const shortWeather = short.timeSeries?.[0];
  const shortPops = short.timeSeries?.[1];
  const weekly = state.forecast[1]?.timeSeries?.[0];
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

function renderWarnings() {
  const list = document.getElementById('warning-list');
  const area = findWarningArea(state.warning, '1220400');
  const warnings = (area?.warnings || [])
    .filter((warning) => warning.status && warning.status !== '解除')
    .map((warning) => ({
      name: WARNING_NAMES[warning.code] || `警報・注意報 ${warning.code}`,
      status: warning.status,
    }));

  if (!warnings.length) {
    list.innerHTML = '<div class="alert-card is-ok"><strong>発表中の警報・注意報なし</strong><span>会場周辺</span></div>';
    setTile('summary-alert', '警報', 'なし', '会場周辺に発表中の警報・注意報はありません。', 'ok');
    return;
  }

  const hasDanger = warnings.some((warning) => warning.name.includes('警報'));
  list.innerHTML = warnings.map((warning) => `
    <div class="alert-card ${warning.name.includes('警報') ? 'is-danger' : ''}">
      <strong>${warning.name}</strong>
      <span>${warning.status}</span>
    </div>
  `).join('');
  setTile('summary-alert', '警報', warnings.map((warning) => warning.name).join(' / '), state.warning?.headlineText || '会場周辺に発表中の情報があります。', hasDanger ? 'danger' : 'watch');
}

function renderTransport() {
  const sources = state.transport?.sources?.length ? state.transport.sources : fallbackTransport();
  const hasIssue = sources.some((source) => source.state === 'danger' || source.state === 'watch');
  const okCount = sources.filter((source) => source.state === 'ok').length;

  setTile(
    'summary-rail',
    '交通',
    hasIssue ? '要確認' : '平常',
    hasIssue ? 'アクセス路線に注意情報があります。' : `${okCount}/${sources.length} 系統が平常表示です。`,
    hasIssue ? 'watch' : 'ok',
  );

  document.getElementById('transport-overview').innerHTML = `
    <article class="transport-summary ${hasIssue ? 'is-watch' : 'is-ok'}">
      <strong>${hasIssue ? '交通は公式ページで再確認' : '会場アクセス路線は平常表示'}</strong>
      <span>京葉線・武蔵野線・京成本線・空港アクセスを優先確認</span>
    </article>
  `;

  document.getElementById('rail-cards').innerHTML = sources.map((source) => `
    <article class="transport-row">
      <div class="transport-row__state state-${stateClass(source.state)}">${source.label || '公式確認'}</div>
      <div class="transport-row__main">
        <h3>${source.name}</h3>
        <div class="transport-lines">${(source.lines || []).map((line) => `<span>${line}</span>`).join('')}</div>
        <p>${source.text || '公式ページで最新情報を確認してください。'}</p>
      </div>
      ${linkButton('確認', source.url)}
    </article>
  `).join('');
}

function renderFallback() {
  setTile('summary-day2', '6/2', '取得エラー', 'キャッシュを更新してください。', 'watch');
  setTile('summary-day3', '6/3', '取得エラー', 'キャッシュを更新してください。', 'watch');
  setTile('summary-alert', '警報', '取得エラー', '公式情報を確認してください。', 'watch');
  renderTransport();
}

function fallbackTransport() {
  return RAIL_SOURCES.map(([name, lines, url]) => ({
    name,
    lines,
    url,
    state: 'official',
    label: '公式確認',
    text: '公式ページで最新情報を確認してください。',
  }));
}

function findWarningArea(data, code) {
  for (const areaType of data?.areaTypes || []) {
    const area = (areaType.areas || []).find((item) => item.code === code);
    if (area) return area;
  }
  return null;
}

function setTile(id, label, title, body, stateName) {
  const element = document.getElementById(id);
  const icon = element.querySelector('svg')?.outerHTML || '';
  element.classList.remove('is-ok', 'is-watch', 'is-danger');
  element.classList.add(`is-${stateName}`);
  element.innerHTML = `${icon}<span>${label}</span><strong>${title}</strong><p>${body}</p>`;
}

function metricCard(label, value, icon, note = '') {
  return `
    <article class="metric-card">
      ${smallIcon(icon)}
      <span>${label}</span>
      <strong>${value}</strong>
      ${note ? `<p>${note}</p>` : ''}
    </article>
  `;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function cacheUrl(path) {
  return `${path}${state.cacheBuster}`;
}

function weatherIcon(weather = '') {
  if (weather.includes('雨')) return smallIcon('cloud-rain');
  if (weather.includes('風')) return smallIcon('wind');
  return smallIcon('cloud-rain');
}

function smallIcon(name) {
  return `<svg aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function linkButton(label, url) {
  return `<a class="link-button" href="${url}" target="_blank" rel="noreferrer">${smallIcon('link')}${label}</a>`;
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

function riskFromDay(day) {
  if (!day) return 'watch';
  const pop = Number(String(day.pop || '').replace('%', ''));
  if (pop >= 80 || windLabel(day.wind) === '強風注意') return 'danger';
  if ((day.weather || '').includes('雨') || pop >= 60 || windLabel(day.wind) === 'やや強い') return 'watch';
  return 'ok';
}

function stateClass(value) {
  if (value === 'danger') return 'danger';
  if (value === 'watch' || value === 'official') return 'watch';
  return 'ok';
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
