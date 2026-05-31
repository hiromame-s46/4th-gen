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
    body: '基本は京葉線で南船橋へ。強風時は総武線と京成本線の迂回も確認。',
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
  ['気象庁 会場周辺の警報・注意報', 'https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=1220400&lang=ja'],
  ['気象庁 雨雲の動き', 'https://www.jma.go.jp/bosai/nowc/#zoom:10/lat:35.686/lon:139.991/colordepth:normal/elements:hrpns'],
  ['気象庁 キキクル', 'https://www.jma.go.jp/bosai/risk/#zoom:10/lat:35.686/lon:139.991/colordepth:normal/elements:flood'],
  ['JR東日本 運行情報', 'https://traininfo.jreast.co.jp/train_info/kanto.aspx'],
  ['京成電鉄 運行情報', 'https://www.keisei.co.jp/'],
  ['羽田空港 遅延欠航', 'https://www.tokyo-haneda.com/flight/dms_cancel_delay.html'],
  ['成田空港 フライト情報', 'https://www.narita-airport.jp/ja/flight/'],
];

const state = {
  warning: null,
  forecast: null,
  transport: null,
  cacheBuster: '',
  loading: false,
};

document.addEventListener('DOMContentLoaded', () => {
  renderStatic();
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

async function refreshAll(force) {
  if (state.loading) return;
  state.loading = true;
  state.cacheBuster = `?t=${Date.now()}`;
  setRefreshState(force ? '更新中' : '読込中');

  try {
    const [warning, forecast, transport] = await Promise.all([
      fetchJson(cacheUrl('cache/warning.json')),
      fetchJson(cacheUrl('cache/forecast.json')),
      fetchJson(cacheUrl('cache/transport.json')),
    ]);
    state.warning = warning;
    state.forecast = forecast;
    state.transport = transport;
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

function renderForecast() {
  const days = getForecastDays();
  const grid = document.getElementById('forecast-grid');

  if (!days.length) {
    grid.innerHTML = '<p class="muted">予報を取得できませんでした。</p>';
    setTile('summary-weather', '天気', '公式確認', '気象庁の会場周辺予報を確認してください。', 'watch');
    setTile('summary-wind', '風', '公式確認', '風の予報を取得できませんでした。', 'watch');
    return;
  }

  const target = days.find((day) => day.date === '2026-06-02') || days[0];
  setTile('summary-weather', '天気', target.weather || '確認中', `降水確率 ${target.pop || '--'} / ${formatShortDate(target.time)}`, riskFromWeather(target));
  setTile('summary-wind', '風', windLabel(target.wind), target.wind || '風の予報を確認中です。', riskFromWind(target.wind));

  grid.innerHTML = days.map((day) => `
    <article class="forecast-card">
      <div class="weather-mark">${weatherIcon(day.weather)}</div>
      <div>
        <time>${formatShortDate(day.time)}</time>
        <strong>${day.weather || '--'}</strong>
        <div class="forecast-metrics">
          <span>${smallIcon('cloud-rain')}降水確率 ${day.pop || '--'}</span>
          <span>${smallIcon('wind')}${day.wind || '風 --'}</span>
          <span>${smallIcon('alert')}波 ${day.wave || '--'}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function getForecastDays() {
  if (!Array.isArray(state.forecast) || !state.forecast.length) return [];
  const short = state.forecast[0];
  const shortWeather = short.timeSeries?.[0];
  const shortPops = short.timeSeries?.[1];
  const weekly = state.forecast[1]?.timeSeries?.[0];
  const area = shortWeather?.areas?.find((item) => item.area?.code === '120010') || shortWeather?.areas?.[0];
  const popArea = shortPops?.areas?.find((item) => item.area?.code === '120010') || shortPops?.areas?.[0];
  const weeklyArea = weekly?.areas?.find((item) => item.area?.code === '120000') || weekly?.areas?.[0];
  const shortPopByTime = new Map((shortPops?.timeDefines || []).map((time, index) => [time, popArea?.pops?.[index]]));
  const weeklyPopByDate = new Map((weekly?.timeDefines || []).map((time, index) => [time.slice(0, 10), weeklyArea?.pops?.[index]]));

  return (shortWeather?.timeDefines || []).map((time, index) => ({
    time,
    date: time.slice(0, 10),
    weather: tidy(area?.weathers?.[index]),
    wind: tidy(area?.winds?.[index]),
    wave: tidy(area?.waves?.[index]),
    pop: normalizePop(shortPopByTime.get(time) || weeklyPopByDate.get(time.slice(0, 10))),
  })).slice(0, 3);
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
  const cards = document.getElementById('rail-cards');
  const hasIssue = sources.some((source) => source.state === 'danger' || source.state === 'watch');

  setTile(
    'summary-rail',
    '交通',
    hasIssue ? '要確認' : '平常',
    hasIssue ? 'アクセス路線に注意情報があります。' : '主要アクセス路線は平常表示です。',
    hasIssue ? 'watch' : 'ok',
  );

  cards.innerHTML = sources.map((source) => `
    <article class="transport-card">
      <div class="transport-card__top">
        <h3>${source.name}</h3>
        <span class="transport-state state-${stateClass(source.state)}">${source.label || '公式確認'}</span>
      </div>
      <div class="transport-lines">${(source.lines || []).map((line) => `<span>${line}</span>`).join('')}</div>
      <p>${source.text || '公式ページで最新情報を確認してください。'}</p>
      <div class="card-links">${linkButton('公式情報', source.url)}</div>
    </article>
  `).join('');
}

function renderFallback() {
  setTile('summary-weather', '天気', '取得エラー', 'キャッシュを更新してください。', 'watch');
  setTile('summary-wind', '風', '取得エラー', 'キャッシュを更新してください。', 'watch');
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

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function cacheUrl(path) {
  return `${path}${state.cacheBuster}`;
}

function weatherIcon(weather = '') {
  if (weather.includes('雨')) return smallIcon('cloud-rain', 'large');
  if (weather.includes('風')) return smallIcon('wind', 'large');
  return smallIcon('cloud-rain', 'large');
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
  if (!wind) return '確認中';
  if (wind.includes('非常に強く') || wind.includes('強く')) return '強風注意';
  if (wind.includes('やや強く')) return 'やや強い';
  return '通常';
}

function riskFromWeather(day) {
  const pop = Number(String(day.pop || '').replace('%', ''));
  if ((day.weather || '').includes('雨') || pop >= 60) return 'watch';
  return 'ok';
}

function riskFromWind(wind = '') {
  if (wind.includes('非常に強く') || wind.includes('強く')) return 'danger';
  if (wind.includes('やや強く')) return 'watch';
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

function formatTime(date) {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function tidy(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}
