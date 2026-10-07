---
id: platforms-and-requirements
title: 対応環境と必要スペック
reading: たいおうかんきょうとひつようすぺっく
category: basics
tags: [基本情報, PC, スペック, DLSS, コンソール]
summary: グローバル版は Windows PC 専用（Steam / PURPLE）。最低は GTX 1050 Ti＋8GB、推奨は RTX 2070＋16GB で、いずれも 100GB の空き容量が必要。DLSS 4.5 対応。コンソール版は準備中で未発表、スマホ版は予定なし。
confidence: official
region: global
updated: 2026-10-08
aliases: [動作環境, 推奨スペック, システム要件, System Requirements, PS5, 対応プラットフォームと必要スペック]
related: [game-overview, steam-vs-purple, recommended-settings, controller-and-steam-deck]
sources:
  - id: S01
    title: AION2 Hub：Aion 2 System Requirements
    url: https://aion2hub.com/guides/aion-2-system-requirements
    date: 2026-09-08
    kind: guide
  - id: S02
    title: AION2 Times：AION2の動作スペック
    url: https://aion2-times.com/aion2-system-requirements/
    date: 2026-09-05
    kind: guide
  - id: S03
    title: AION2 Times：グローバル版はDLSS 4.5対応
    url: https://aion2-times.com/aion2-global-dlss45/
    date: 2026-10-01
    kind: guide
  - id: S04
    title: AION2 Times：PS5・スマホ版は？｜PC専用でコンソールは準備中
    url: https://aion2-times.com/aion2-console-version-confirmed/
    date: 2026-09-08
    kind: guide
  - id: S05
    title: NC（PURPLE Lounge）：Launch FAQ
    url: https://lounge.plaync.com/feed/82939?country=US&locale=en-US
    date: 2026-10-05
    kind: official
  - id: S06
    title: あせろぐ：AION2 アーリーアクセスと正式サービスの日程・始め方
    url: https://asellog.com/aion2-launch/
    date: 2026-09-30
    kind: guide
---

AION2 グローバル版は **Windows PC 専用** で、Steam か NC のランチャー「PURPLE」から無料でダウンロードできます。必要スペックは Steam ストアページに公式掲載されており、最低環境でも 100GB の空き容量が必要です。コンソール版は「準備中」と開発陣が語っていますが機種・時期は未発表、スマートフォン版は予定なしと NC が明言しています。

根拠：[S01] [S02] [S04] [S05]

## 必要スペック（Steam 公式）

| 項目 | 最低環境 | 推奨環境 |
| --- | --- | --- |
| OS | Windows 10 / 11（64bit） | Windows 10 / 11（64bit） |
| CPU | AMD Ryzen 5 2600 ／ Intel Core i5-10500 | AMD Ryzen 7 3700X ／ Intel Core i7-11700 |
| メモリ | 8GB | 16GB |
| GPU | GeForce GTX 1050 Ti（4GB）／ Radeon RX 470（4GB） | GeForce RTX 2070（8GB）／ Radeon RX 5700 XT（8GB） |
| DirectX | 12 | 12 |
| ストレージ | 100GB の空き容量（SSD 推奨） | 100GB の空き容量（SSD 推奨） |
| ネットワーク | ブロードバンド接続 | ブロードバンド接続 |

根拠：[S01] [S02] [S06]

> **注意**：Steam ストアの注記では、フルHD（1920×1080）で遊ぶ場合、最低環境ではグラフィックプリセットを「非常に低い」、推奨環境でも「低い」に設定することが前提です。推奨環境は「高画質で快適」の保証ではなく、「低設定で安定して遊べる目安」です。高設定・高フレームレートを狙うなら推奨より一段上の GPU と 16GB 以上のメモリを用意してください。

根拠：[S02] [S06]

## ストレージの目安

- 最低・推奨とも 100GB 以上の空き容量が必要です。公式ヘルプでは SSD の使用を推奨しています。
- Steam のダウンロード容量はアーリーアクセス時点で約 86GB（aion2maps の実測）と報告されており、アップデートで増えます。HDD でも起動はしますが、マップ切り替えやロードの快適さを考えると SSD を強く推奨します。

根拠：[S02] [S06]

## DLSS / FSR

- グローバル版は 2026年9月30日の開始時点で **NVIDIA DLSS 4.5** に対応しています（NVIDIA 公表）。
- 公式お知らせ（2026年9月30日）で、GeForce RTX 50 シリーズのノートPC向け GPU で DLSS フレーム生成を使うと一部環境でゲームが異常終了する場合があると案内されました。フレーム生成を使う場合は NVIDIA コントロールパネルで垂直同期を「オン」にする対処が示されています。
- DLSS 5 は NVIDIA と共同で準備中と開発陣が述べていますが、実装時期は未定です。
- AMD の FSR 4 は韓国版に2026年7月15日に入っていますが、グローバル版での対応状況を明言した公式情報は見つかっていません。AMD GPU の人は実機の設定画面で確認してください。

根拠：[S03]

> **韓国版のみ**：韓国版の2026年7月15日パッチノートでは、RTX 50 シリーズで最大 x6 のフレーム生成が利用できると記載されています。グローバル版で同じ設定項目があるかは、ゲーム内の設定画面で確認してください。

根拠：[S03]

## コンソール・スマートフォン・その他の環境

| 環境 | 状況 |
| --- | --- |
| PlayStation / Xbox などコンソール | 開発ディレクターが「コンソールでのローンチも準備している。優先はグローバル PC 版で、その後に続く」と発言（2026年9月7日の gamescom Q&A）。機種・時期・価格は未発表。PC とのクロスプレイは「現時点では非対応の見込み」だが未確定 |
| スマートフォン | グローバル版は PC 専用。NC は「モバイル版の計画はない」と回答（韓国・台湾版のみ PC とスマホのクロスプレイ） |
| コントローラー | 「コントローラーで遊べるが、公式サポートではない」（NC Launch FAQ）。詳しくは [[controller-and-steam-deck]] |
| Linux / Steam Deck | 「遊べる場合があるが、公式サポートは Windows PC の Steam と PURPLE のみ」（NC Launch FAQ） |
| Mac | Steam ストアは Windows のみを掲載 |

根拠：[S01] [S04] [S05]

## 自分の PC で動くか確認する順番

1. OS が 64bit の Windows 10 / 11 か（必須）。
2. GPU が GTX 1050 Ti / RX 470 以上か。
3. メモリが 8GB 以上か（快適に遊ぶなら 16GB 以上）。
4. SSD に 100GB 以上の空きがあるか。
5. 数年以内のミドルクラス以上のゲーミング PC なら、最低環境はおおむねクリアできます。

根拠：[S02]

## 関連記事

- [[recommended-settings]] — 起動後のグラフィック・操作設定
- [[steam-vs-purple]] — どちらのランチャーで始めるか
- [[controller-and-steam-deck]] — パッド操作と Steam Deck
