# 櫻坂46 四期生LIVE 天気・交通ボード

LaLa arena TOKYO-BAYで開催される櫻坂46「四期生LIVE」来場者向けの、会場周辺の天気・風・雨・警報・交通情報ダッシュボードです。

台風の位置表示には寄せず、来場判断に使いやすい「天気」「風」「警報」「交通」をモバイル優先で表示します。

## 構成

- `scripts/update.php`: 気象庁と交通各社の公式ページを取得し、`cache/*.json` を更新
- `index.html` / `app.js` / `styles.css`: JSONキャッシュを表示する静的フロント
- `assets/weather-bay.png`: ヘッダー背景画像
- `cache/`: cronで更新される配信用JSON

Nodeは使いません。PHP CLIとcronで更新する想定です。

## 初回更新

```bash
php scripts/update.php
```

## cron例

5分おきに更新する例です。

```cron
*/5 * * * * cd /path/to/typhoon-site && /usr/bin/php scripts/update.php >> logs/cron.log 2>&1
```

`logs/` を使う場合は先に作成してください。

## ローカル確認

```bash
php -S localhost:4173
```

ブラウザで `http://localhost:4173/` を開きます。

## 取得する情報

- 気象庁: 会場周辺の警報・注意報、千葉県北西部の天気予報、雨雲・キキクルへの導線
- 鉄道公式ページ: JR東日本、京成電鉄、京急線、東京モノレール
- 航空公式ページ: 羽田空港、成田空港、ANA、JAL
- 避難情報リンク: 船橋市防災ポータル、千葉県防災ポータル、Yahoo!避難情報

航空会社や自治体の避難指示は公開APIが限られるため、ダッシュボード上では公式確認リンクを最短導線として配置しています。
