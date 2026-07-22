# Collocation Sprint

日本語から英語コロケーションを瞬時に取り出し、即興発話につなげる静的Webアプリです。

## GitHub Pagesで公開する

このZIPを解凍すると、以下の6ファイルが出てきます。

- index.html
- styles.css
- app.js
- collocations.json
- README.md
- COLLOCATIONS.md

GitHubの `collocation-sprint` リポジトリのトップ階層に、
**この6ファイルをそのまま全部アップロード**してください。

フォルダ作成は不要です。
ZIPファイルそのものをGitHubへアップロードするのではありません。

GitHub Pagesでは `index.html` が公開起点になります。

## JSONでコロケーションを増やす

`collocations.json` に同じ形式のデータを追加してください。

```json
{
  "id": "bridge-the-gap",
  "en": "bridge the gap",
  "ja": "ギャップを埋める",
  "category": "Communication",
  "example_en": "Speaking practice can bridge the gap between knowledge and real-time use.",
  "example_ja": "スピーキング練習は知識と実際の運用のギャップを埋められます。",
  "prompt_ja": "知識と実際の運用のギャップについて英語で1文言ってみましょう。"
}
```

アプリ右上の「＋」からJSONを追加することもできます。
