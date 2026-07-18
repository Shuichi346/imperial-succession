<table>
  <thead>
    <tr>
      <th style="text-align:center"><a href="README_ja.md">日本語</a></th>
      <th style="text-align:center"><a href="README.md">English</a></th>
    </tr>
  </thead>
</table>

# 皇位継承系譜

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.13.0-339933?logo=node.js&logoColor=white)](package.json)

初代神武天皇から現在の第126代天皇までの皇位継承をインタラクティブに可視化した日本語コンテンツです。本系譜は、主要な継承ラインに加え、北朝の分岐、中間的な皇子・皇族の子孫、および1947年に皇籍を離脱した11の旧宮家を掲載しています。

## プレビュー

<a href="https://imperial-succession.sm-macm4.chatgpt.site/">
  <img src="githubreadme/imperial-succession-preview.jpeg" alt="インタラクティブな皇位継承系譜サイト" width="480">
</a>

[ライブサイトを開く](https://imperial-succession.sm-macm4.chatgpt.site/)

## 機能

- 伝統的な初代天皇から現在の天皇まで、126代すべての天皇を探索できます。
- 五代にわたる北朝の系譜と南北朝の合一をたどることができます。
- 11の旧宮家の系譜と、1947年の皇籍離脱の経緯を確認できます。
- 天皇・皇子・皇族の子孫・旧宮家を、名前または読みで検索できます。
- 歴史的な時代間を移動したり、系譜を横断的に表示したり、ズームレベルを調整したりできます。
- 在位年・系譜の繋がり・読み・歴史的注記を含むプロフィールカードを開くことができます。
- 女性天皇や非天皇の系譜ノードを、専用のビジュアル表現で区別できます。
- デスクトップおよびモバイルのレイアウトに対応したレスポンシブインターフェースを、キーボードおよびスクリーンリーダーのラベルとともに利用できます。

## データソース

親子関係の核となるデータおよび中間的な皇族の情報は、宮内庁の[歴代天皇の系図](https://www.kunaicho.go.jp/learn/about/kosei/keizu.html)に基づいています。系譜の視認性を保つため、旧宮家の一部の中間当主は意図的に省略しています。

## 技術スタック

- Next.js および React
- TypeScript
- Vinext および Vite
- Cloudflare Workers 互換ランタイム
- 可視化およびレスポンシブインターフェース向けのプレーン CSS

## 動作要件

- Node.js 22.13.0 以降
- npm

本番ビルドおよびテストスクリプトは、GNU `timeout` を含む Linux ユーティリティを使用します。Vite サーバーによるローカル開発では、これらのスクリプトは必要ありません。

## インストール

```bash
git clone https://github.com/Shuichi346/imperial-succession.git
cd imperial-succession
npm ci
```

## 使い方

ローカル開発サーバーを起動します：

```bash
npm run dev
```

その後、ターミナルに表示されたローカル URL をブラウザで開いてください。

現在の読み取り専用可視化には、環境変数やデータベース設定は必要ありません。

## 開発

```bash
npm run lint
npm run build
npm test
```

- `npm run lint`：ESLint を使用して TypeScript および React のソースコードをチェックします。
- `npm run build`：デプロイ可能なワーカーアーティファクトを作成し、検証します。
- `npm test`：サイトをビルドし、レンダリングされた HTML メタデータを検証します。

## セキュリティに関する注意事項

現在の開発ツールチェーンは `ws@8.18.0` を解決しており、これは既知のWebSocketリソース枯渇に関する脆弱性アドバイザリの対象となっています。また、Vite開発サーバーはすべてのネットワークインターフェースでリッスンするよう設定されています。これは、信頼されていないピアから到達可能なネットワーク上で `npm run dev` を実行している開発者にのみ影響します。デプロイ済みの公開WorkerやアカウントのクレデンシャルはIとは無関係です。Viteの依存関係チェーンを更新し、開発サーバーのデフォルトをループバックのみのリスナーに変更することを推奨しますが、これらの対応は意図的に延期されています。

## プロジェクト構成

```text
app/
  page.tsx            インタラクティブな系譜インターフェース
  emperors.ts         天皇のレコードおよび時代ナビゲーション
  royal-lineage.ts    中間的な皇族の系譜レコード
  former-houses.ts    旧宮家のレコード
  globals.css         可視化およびレスポンシブスタイル
public/               静的アセット
tests/                レンダリングされた HTML のテスト
worker/               Cloudflare 互換ワーカーのエントリーポイント
```

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) のもとで公開されています。
