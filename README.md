# Collocation Sprint

日本語から英語コロケーションを瞬時に取り出し、即興発話につなげる静的Webアプリです。

## GitHub Pagesで公開する

1. GitHubで `collocation-sprint` という新規リポジトリを作成
2. このZIPを解凍
3. **解凍して出てきた中身**（`index.html`, `css/`, `js/`, `data/`, `COLLOCATIONS.md`, `README.md`）をリポジトリ直下へアップロード
4. GitHub Settings → Pages → Deploy from a branch → `main` / `/root`
5. 公開URLを開く

※ ZIPファイルそのものをGitHubへアップロードするのではありません。

## 初期データ

`data/collocations.json` に25件あります。

## JSONで追加する方法

### 方法A: アプリ画面から追加
右上の「＋」→ JSONファイルを選択。追加データはブラウザのlocalStorageに保存されます。

### 方法B: GitHub上の初期データ自体を増やす
`data/collocations.json` の配列に同じ形式のオブジェクトを追加してコミットします。

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

## 練習モード

- Instant Recall: 日本語 → 英語チャンク
- Rapid Speaking: ターゲット表現を使って8秒以内に1文
- Listen & Repeat: ブラウザ読み上げ音声で反復
- Library: 英日一覧・検索・カテゴリー絞り込み

## データと進捗

- 追加JSON: localStorage
- 学習進捗: localStorage
- 「現在のJSONを書き出す」で学習データ本体をJSONとして保存可能
