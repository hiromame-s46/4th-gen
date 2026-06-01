<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo "Forbidden\n";
    exit(1);
}

$root = dirname(__DIR__);
$cacheDir = $root . '/cache';

if (!is_dir($cacheDir) && !mkdir($cacheDir, 0775, true) && !is_dir($cacheDir)) {
    fwrite(STDERR, "Failed to create cache directory: {$cacheDir}\n");
    exit(1);
}

$transportSources = [
    [
        'id' => 'jr-east',
        'name' => 'JR東日本 関東エリア',
        'lines' => ['京葉線', '武蔵野線', '総武快速線', '成田線'],
        'url' => 'https://traininfo.jreast.co.jp/train_info/kanto.aspx',
        'watch' => ['京葉線', '武蔵野線', '総武快速線', '成田線', '中央・総武'],
    ],
    [
        'id' => 'keisei',
        'name' => '京成電鉄',
        'lines' => ['京成本線', '成田スカイアクセス', '押上線'],
        'url' => 'https://www.keisei.co.jp/',
        'watch' => ['京成線', '京成本線', '成田スカイアクセス', '押上線', '運行情報'],
    ],
    [
        'id' => 'keikyu',
        'name' => '京急線',
        'lines' => ['京急空港線', '京急本線', '都営浅草線直通'],
        'url' => 'https://unkou.keikyu.co.jp/index.html',
        'watch' => ['空港線', '京急線', '羽田空港', '運行情報'],
    ],
    [
        'id' => 'monorail',
        'name' => '東京モノレール',
        'lines' => ['羽田空港線', '浜松町'],
        'url' => 'https://www.tokyo-monorail.co.jp/',
        'watch' => ['運行情報', '東京モノレール', '羽田空港線'],
    ],
];

$result = [
    'generatedAt' => gmdate('c'),
    'ok' => true,
    'errors' => [],
];

try {
    $typhoonList = fetchJson('https://www.jma.go.jp/bosai/information/data/typhoon.json');
    $items = [];
    foreach ($typhoonList as $item) {
        $eventId = $item['eventId'] ?? null;
        $specs = $eventId ? fetchJson("https://www.jma.go.jp/bosai/typhoon/data/{$eventId}/specifications.json") : [];
        $items[] = buildTyphoonSummary($item, $specs);
    }

    writeJson($cacheDir . '/typhoon.json', [
        'updatedAt' => gmdate('c'),
        'items' => $items,
    ]);
} catch (Throwable $error) {
    $result['errors'][] = 'typhoon: ' . $error->getMessage();
}

try {
    writeJson($cacheDir . '/satellite.json', updateSatelliteCache($cacheDir));
} catch (Throwable $error) {
    $result['errors'][] = 'satellite: ' . $error->getMessage();
}

try {
    writeJson(
        $cacheDir . '/warning.json',
        fetchJson('https://www.jma.go.jp/bosai/warning/data/warning/120000.json')
    );
} catch (Throwable $error) {
    $result['ok'] = false;
    $result['errors'][] = 'warning: ' . $error->getMessage();
}

try {
    writeJson(
        $cacheDir . '/forecast.json',
        fetchJson('https://www.jma.go.jp/bosai/forecast/data/forecast/120000.json')
    );
} catch (Throwable $error) {
    $result['ok'] = false;
    $result['errors'][] = 'forecast: ' . $error->getMessage();
}

$transport = [
    'updatedAt' => gmdate('c'),
    'sources' => [],
];

foreach ($transportSources as $source) {
    $transport['sources'][] = loadTransportSource($source);
}

writeJson($cacheDir . '/transport.json', $transport);
writeJson($cacheDir . '/manifest.json', $result);

fwrite(STDOUT, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL);
exit($result['ok'] ? 0 : 2);

function loadTransportSource(array $source): array
{
    try {
        $html = fetchText($source['url']);
        $text = normalizeText(stripHtml($html));
        $extracted = extractTransportText($text, $source);
        $state = classifyTransport($extracted['classificationText']);
        $displayText = $extracted['displayText'];

        if ($state === 'official' && mb_strlen($displayText) > 180) {
            $displayText = '公式ページを取得しました。リンク先で詳細を確認してください。';
        }

        return $source + [
            'state' => $state,
            'label' => labelForTransport($state),
            'text' => $displayText !== '' ? $displayText : '公式ページを取得しました。リンク先で詳細を確認してください。',
            'updatedAt' => gmdate('c'),
        ];
    } catch (Throwable $error) {
        return $source + [
            'state' => 'official',
            'label' => '公式確認',
            'text' => '自動取得に失敗しました。公式ページで確認してください。(' . $error->getMessage() . ')',
            'updatedAt' => null,
        ];
    }
}

function buildTyphoonSummary(array $info, array $specs): array
{
    $title = null;
    $analysis = null;
    $forecasts = [];

    foreach ($specs as $part) {
        if (($part['part'] ?? null) === 'title') {
            $title = $part;
            continue;
        }

        if (($part['advancedHours'] ?? null) === 0) {
            $analysis = $part;
        }

        if (($part['validtime']['JST'] ?? null) !== null) {
            $forecasts[] = compactTyphoonPart($part);
        }
    }

    return [
        'eventId' => $info['eventId'] ?? null,
        'title' => $info['headTitle'] ?? $info['controlTitle'] ?? '台風情報',
        'name' => $title['name']['jp'] ?? null,
        'category' => $title['category']['jp'] ?? $analysis['category']['jp'] ?? null,
        'issue' => $title['issue']['JST'] ?? $info['reportDatetime'] ?? null,
        'reportDatetime' => $info['reportDatetime'] ?? $info['targetDatetime'] ?? null,
        'publishingOffice' => $info['publishingOffice'] ?? '気象庁',
        'analysis' => compactTyphoonPart($analysis ?? []),
        'eventForecasts' => [
            '2026-06-02' => nearestTyphoonForecast($forecasts, '2026-06-02T19:00:00+09:00'),
            '2026-06-03' => nearestTyphoonForecast($forecasts, '2026-06-03T19:00:00+09:00'),
        ],
    ];
}

function compactTyphoonPart(array $part): array
{
    return [
        'label' => is_array($part['part'] ?? null) ? ($part['part']['jp'] ?? null) : ($part['part'] ?? null),
        'validtime' => $part['validtime']['JST'] ?? null,
        'location' => $part['location'] ?? null,
        'category' => $part['category']['jp'] ?? null,
        'intensity' => ($part['intensity'] ?? '-') !== '-' ? ($part['intensity'] ?? null) : null,
        'course' => $part['course'] ?? null,
        'speed' => $part['speed']['km/h'] ?? null,
        'pressure' => $part['pressure'] ?? null,
        'wind' => $part['maximumWind']['sustained']['m/s'] ?? null,
        'gust' => $part['maximumWind']['gust']['m/s'] ?? null,
    ];
}

function nearestTyphoonForecast(array $forecasts, string $target): ?array
{
    $targetTime = strtotime($target);
    $nearest = null;
    $nearestDelta = PHP_INT_MAX;

    foreach ($forecasts as $forecast) {
        $time = strtotime($forecast['validtime'] ?? '');
        if ($time === false) {
            continue;
        }
        $delta = abs($time - $targetTime);
        if ($delta < $nearestDelta) {
            $nearest = $forecast;
            $nearestDelta = $delta;
        }
    }

    return $nearest;
}

function updateSatelliteCache(string $cacheDir): array
{
    $page = fetchText('https://www.data.jma.go.jp/mscweb/data/himawari/sat_img.php');
    if (!preg_match('/<select name="slt_time"[^>]*>\s*<option value=([0-9]{4})>([^<]+)<\/option>/u', $page, $matches)) {
        throw new RuntimeException('Satellite time option not found');
    }

    $timeCode = $matches[1];
    $label = trim($matches[2]);
    $images = [
        'infrared' => [
            'label' => '赤外',
            'url' => "https://www.data.jma.go.jp/mscweb/data/himawari/img/jpn/jpn_b13_{$timeCode}.jpg",
            'path' => $cacheDir . '/satellite-jpn-b13.jpg',
            'publicPath' => 'cache/satellite-jpn-b13.jpg',
        ],
        'waterVapor' => [
            'label' => '水蒸気',
            'url' => "https://www.data.jma.go.jp/mscweb/data/himawari/img/jpn/jpn_b08_{$timeCode}.jpg",
            'path' => $cacheDir . '/satellite-jpn-b08.jpg',
            'publicPath' => 'cache/satellite-jpn-b08.jpg',
        ],
    ];

    foreach ($images as $image) {
        writeBinary($image['path'], fetchText($image['url']));
    }

    return [
        'updatedAt' => gmdate('c'),
        'timeCode' => $timeCode,
        'label' => formatSatelliteLabel($label),
        'source' => '気象庁 衛星画像（ひまわり）',
        'images' => array_map(static fn (array $image): array => [
            'label' => $image['label'],
            'path' => $image['publicPath'],
            'url' => $image['url'],
        ], $images),
    ];
}

function formatSatelliteLabel(string $label): string
{
    $date = DateTimeImmutable::createFromFormat('H:i T d F Y', $label, new DateTimeZone('UTC'));
    if (!$date) {
        return $label;
    }

    return $date
        ->setTimezone(new DateTimeZone('Asia/Tokyo'))
        ->format('Y/m/d H:i') . ' JST';
}

function extractTransportText(string $text, array $source): array
{
    $cleaned = str_replace(
        ['遅延証明書', '遅延・欠航サポート', '遅延欠航', '振替輸送のご案内'],
        ['証明書', 'サポート', '発着案内', '案内'],
        $text
    );

    $statuses = [];
    foreach ($source['lines'] as $line) {
        $escaped = preg_quote($line, '/');
        if (preg_match('/' . $escaped . '\s*(平常運転|通常通り|運転見合わせ|運休|一部運休|遅延|遅れ|お知らせ|運転再開|ダイヤ乱れ|運行変更)([^。]{0,120})/u', $cleaned, $matches)) {
            $detail = in_array($matches[1], ['平常運転', '通常通り'], true) ? '' : ($matches[2] ?? '');
            $statuses[] = trim($line . ': ' . $matches[1] . $detail);
        }
    }

    if (($source['id'] ?? '') === 'keisei' && preg_match('/現在、?京成線は平常通り運行しています|京成線は平常通り運行しています/u', $cleaned)) {
        $statuses[] = '京成線: 平常通り運行しています';
    }

    $statuses = array_values(array_unique(array_filter($statuses)));
    if ($statuses !== []) {
        return [
            'displayText' => implode(' / ', $statuses),
            'classificationText' => implode(' ', $statuses),
        ];
    }

    $focusedKeywords = array_values(array_filter(
        $source['watch'],
        static fn (string $keyword): bool => $keyword !== '運行情報'
    ));
    $snippet = extractSnippet($cleaned, $focusedKeywords);

    return [
        'displayText' => $snippet,
        'classificationText' => $snippet,
    ];
}

function classifyTransport(string $text): string
{
    if ($text === '') {
        return 'official';
    }
    if (preg_match('/運転見合わせ|運休|終日運休|欠航|大幅な遅れ|見合わせ/u', $text)) {
        return 'danger';
    }
    if (preg_match('/遅れ|遅延|一部列車|ダイヤ乱れ|振替輸送|運行変更/u', $text)) {
        return 'watch';
    }
    if (preg_match('/平常|遅延はありません|通常通り|支障はありません/u', $text)) {
        return 'ok';
    }
    return 'official';
}

function labelForTransport(string $state): string
{
    return match ($state) {
        'danger' => '運休・見合わせ',
        'watch' => '遅延注意',
        'ok' => '平常',
        default => '公式確認',
    };
}

function extractSnippet(string $text, array $keywords): string
{
    $candidates = [];
    foreach ($keywords as $keyword) {
        $position = mb_strpos($text, $keyword);
        if ($position !== false) {
            $start = max(0, $position - 80);
            $candidates[] = mb_substr($text, $start, 340);
        }
    }
    $joined = implode(' / ', array_values(array_unique($candidates)));
    return mb_strlen($joined) > 520 ? mb_substr($joined, 0, 520) . '...' : $joined;
}

function fetchJson(string $url): array
{
    $json = fetchText($url);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid JSON: ' . $url);
    }
    return $data;
}

function fetchText(string $url): string
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 12,
            'header' => implode("\r\n", [
                'User-Agent: sakurazaka-typhoon-live-board/1.0 (+cron PHP scraper)',
                'Accept: text/html,application/json;q=0.9,*/*;q=0.8',
            ]),
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);

    $data = @file_get_contents($url, false, $context);
    if ($data === false) {
        $error = error_get_last();
        throw new RuntimeException($error['message'] ?? 'Fetch failed: ' . $url);
    }
    return $data;
}

function writeJson(string $path, mixed $data): void
{
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        throw new RuntimeException('JSON encode failed: ' . $path);
    }

    $tmpPath = $path . '.tmp';
    if (file_put_contents($tmpPath, $encoded . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('Write failed: ' . $tmpPath);
    }
    if (!rename($tmpPath, $path)) {
        @unlink($tmpPath);
        throw new RuntimeException('Rename failed: ' . $path);
    }
}

function writeBinary(string $path, string $data): void
{
    $tmpPath = $path . '.tmp';
    if (file_put_contents($tmpPath, $data, LOCK_EX) === false) {
        throw new RuntimeException('Write failed: ' . $tmpPath);
    }
    if (!rename($tmpPath, $path)) {
        @unlink($tmpPath);
        throw new RuntimeException('Rename failed: ' . $path);
    }
}

function stripHtml(string $html): string
{
    $withoutScripts = preg_replace('/<script[\s\S]*?<\/script>/iu', ' ', $html) ?? $html;
    $withoutStyles = preg_replace('/<style[\s\S]*?<\/style>/iu', ' ', $withoutScripts) ?? $withoutScripts;
    return html_entity_decode(strip_tags($withoutStyles), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function normalizeText(string $text): string
{
    return trim((string) preg_replace('/\s+/u', ' ', $text));
}
