---
id: combat-analysis-dps-meter
title: DPSメーター
reading: でぃーぴーえすめーたー
category: systems
order: 99
tags: [戦闘分析, DPSメーター, ローテーション, 検証, Ctrl+X]
summary: ゲーム内蔵のダメージメーター「戦闘分析」はCtrl+Xで開き、最初のストーリークエストで解放される。総ダメージ、DPS、スキル別の割合、背面攻撃・パーフェクト・スマイトの割合、履歴を見られ、ローテーションの調整に使える。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Combat Analysis, DPS Meter, ダメージメーター, 戦闘分析, Ctrl+X, ゲーム内DPSメーター]
related: [how-damage-works, stats-explained, rotation-and-skill-macros, class-tier-and-recommendation, rules-and-policies, useful-sites-and-tools]
sources:
  - id: S01
    title: Aion 2 Maps：DPS meters
    url: https://aion2maps.com/guides/dps-meters/
    date: 2026-09-30
    kind: guide
  - id: S02
    title: Aion2 Guide（aion2.run）：Game systems
    url: https://aion2.run/en/systemes
    date: 2026-10-05
    kind: guide
  - id: S03
    title: AION2 Times：韓国・台湾の実測DPSの見方
    url: https://aion2-times.com/aion2-kr-dps-stats-howto/
    date: 2026-10-06
    kind: guide
  - id: S04
    title: Aion 2 Maps：What unlocks when
    url: https://aion2maps.com/guides/unlocks/
    date: 2026-10-04
    kind: guide
---

戦闘分析（Combat Analysis）は、AION2 に最初から入っている **ダメージメーター** です。自分のダメージをその場で確認でき、スキルを撃つ順番（ローテーション）を直すのに役立ちます。リスクがなく、追加のツールも要りません。

根拠：[S01] [S02]

## 開き方と解放

- キーは **Ctrl + X** です。
- 最初のストーリークエスト（チュートリアル）で解放されます。メール、チャット、パーティ、マップ、HUD編集などと同じ時期です。

根拠：[S01] [S04]

## 画面で分かること

| 表示 | 内容 |
| --- | --- |
| 総ダメージ・DPS・総ヒット数 | 記録した区間の合計 |
| 背面攻撃・パーフェクト・スマイト | ヒットのうち何割がそれだったか（割合） |
| スキル別の列 | スキルごとのダメージと割合 |
| 受けたヒット | 受けた攻撃の記録 |
| 履歴 | 過去に記録した戦闘の一覧 |
| ボタン | 開始（Start）とリセット（Reset） |

ダメージの仕組みは [[how-damage-works]]、パーフェクトやスマイトなどのステータスは [[stats-explained]] を参照してください。

根拠：[S01]

## 使い方

1. 戦闘の前に戦闘分析を開き、Startを押す。
2. 同じ条件でスキルの順番を変えて数回試す。
3. スキル別の割合と、背面攻撃・パーフェクトの割合を比べる。
4. ダメージの大きい順番を、ローテーションに採用する。[[rotation-and-skill-macros]]

根拠：[S01] [S02]

## 外部のDPSメーター

- アジア版のサーバーで、非公式のDPSメーターが先に登場しました。グローバル版のアーリーアクセス開始までに、複数のメーターがグローバル版に対応しました。
- 主要なものは、ゲームの通信パケットを読むだけで、ゲーム本体のプロセスを改変・読み取りしないとされています。
- アーリーアクセス前のバージョンは、グローバル版のクライアントがping用のパケットを異なる形式で送るため、pingを正しく表示しないことがあります。
- NCの規約上の扱いは [[rules-and-policies]] を確認してください。外部ツールを使うかどうかは自己責任です。

根拠：[S01]

> **韓国版のみ**：「クラスのDPSランキング」として紹介されている実測値の多くは、韓国・台湾版でDPSメーターを入れているプレイヤーの記録を集計したものです。グローバル版のデータではなく、戦闘力が同程度の人どうしで比べた中央値の傾向を表しています。そのままグローバル版のクラス優劣とは読まないでください。根拠：[S03]
