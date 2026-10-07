---
id: market-and-exchange
title: 取引所と交換所
reading: とりひきじょとこうかんじょ
category: economy
tags: [取引所, 交換所, メンバーシップ, 手数料, ギーナ箱]
summary: サーバー取引所と統合取引所の違い、Lv45 で解放、非会員は出品のみ・購入は会員のみという公式告知と実機報告の食い違い、手数料 12%、ギーナ↔キューナ交換所の仕組み。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Market, Exchange, Quna Exchange, World Market, 統合取引所, サーバー取引所, オークション, マーケット, Brokerage, 手数料]
related: [kina-and-bound-kina, quna, membership, trading-rules, kina-farming]
sources:
  - id: S01
    title: "NC：8/18 New Product Info: Special Quai Membership（9/28 改定）"
    url: https://aion2.plaync.com/en-us/board/notice/view?articleId=6a850010fa34c1011d6273b2
    date: 2026-09-28
    kind: official
  - id: S02
    title: Aion 2 Maps：Membership, Founder's Packs and the shop
    url: https://aion2maps.com/guides/membership-and-shop/
    date: 2026-10-01
    kind: guide
  - id: S03
    title: Aion 2 viki：Market and Exchange
    url: https://aion2.vi.ki/market-and-exchange
    date: 2026-09-30
    kind: guide
  - id: S04
    title: AION2 Times：取引所とお金の基礎
    url: https://aion2-times.com/aion2-exchange-money-basics/
    date: 2026-10-06
    kind: guide
  - id: S05
    title: あせろぐ：メンバーシップと課金
    url: https://asellog.com/aion2-membership/
    date: 2026-09-30
    kind: guide
  - id: S06
    title: Aion 2 Maps：What's different on Global
    url: https://aion2maps.com/guides/global-differences/
    date: 2026-10-01
    kind: guide
  - id: S07
    title: DB：ギーナ（ギーナ箱の種類）
    url: https://aion2.gaming.tools/ja/items/930100031
    date: 2026-10-05
    kind: database
  - id: S08
    title: AION2 Hub：Launch Scale Test Ends — Trading Off
    url: https://aion2hub.com/news/aion-2-launch-scale-test-ends-trading-disabled-priority-queue
    date: 2026-09-19
    kind: guide
---

取引所（Market）は、プレイヤー同士がギーナでアイテムを売り買いする場所です。グローバル版ではプレイヤー間の直接取引が無効化されているため、他人とアイテムをやり取りする手段は実質この取引所だけです。使う前に知っておくべきことが3つあります。**Lv45 で解放される**、**購入にはメンバーシップが必要**、**(刻印) 付きのアイテムは出せない**。

## 2種類の取引所

| 取引所 | 取引相手 | 現在の状態 |
| --- | --- | --- |
| サーバー取引所（Server Market） | 同じサーバーのプレイヤー | アーリーアクセス初日（9/30）から稼働 |
| 統合取引所（Cross-Server / World Market） | 同じリージョンの全サーバー | **未開放**。各サーバーの成長段階がそろってから開く予定 |

当面は同じサーバーの相手としか取引できないため、同じアイテムでもサーバーごとに相場が違います。アーリーアクセス用サーバーは正式サーバーと分かれた経済圏です。根拠：[S03] [S04] [S05]

## 解放条件とメンバーシップ

取引所はグローバル版では **レベル 45** で開きます（韓国版の 16 とは異なります）。根拠：[S06]

メンバーシップとの関係は、資料によって説明が分かれています。

| 資料 | 非会員 | 会員 |
| --- | --- | --- |
| NC 公式告知（9/28 改定） | 出品はできるが購入はできない | 出品と購入 |
| Aion 2 Maps（実機） | クライアント上では出品もできない（告知と矛盾） | 出品と購入（同時に 10 件まで） |
| AION2 Times | 出品も購入もできない | 出品と購入 |

根拠：[S01] [S02] [S04]

> **注意**：公式告知上は「非会員も出品可」ですが、実機では出品もできないという報告があります。**取引所を使うつもりならメンバーシップが必要** と考えておくのが安全です。ゲーム内の取引所画面に表示される条件を優先してください。

メンバーシップは **購入したサーバーの全キャラクター** に効き、別サーバーには効きません。取引所を使うキャラクターがいるサーバーで加入してください。詳細は [[membership]] を参照。根拠：[S04] [S05]

## 手数料と仕組み

| 項目 | 内容 |
| --- | --- |
| 出品手数料 | 2%。取り消し・期限切れでも戻らない（再出品で再度かかる）。刻印ギーナから先に引かれる |
| 売却税 | 10% |
| 出品期間 | 約3日 |
| 同時出品数 | 10 件 |
| 1回の購入 | 5 件まで。スタックの一部だけは買えない |
| 売上の受取 | 自動では入らない。「精算」タブから受け取る。1日の精算上限あり |
| 支払い | 購入は **通常ギーナのみ**。刻印ギーナは使えない |

根拠：[S02]

販売画面には、過去 28 日間の実際の取引額（最安・最高・平均・直近）と現在の最安出品が表示されます。初日〜数日は出品が少なく高値になりやすいため、相場が落ち着くまで購入は待つのが定石です。根拠：[S02] [S03]

> **注意**：台湾版ではサーバー取引所 10%・ワールド取引所 20% の税率が報告されていますが、グローバル版の公式告知には税率の記載がありません。上の数値は実機の解析値です。根拠：[S02] [S03]

## 出品できないもの

- 名前に **(刻印)** が付くアイテム（NPC 商店の消耗品、パス・出席・イベント報酬の多く）
- 一度装着して魂刻印が付いた装備（売る予定の装備は装着しない）
- オードエネルギー、挑戦券、ヒドゥンキューブの鍵、戦闘強化スクロール、神石、完成した遠征の翼、羽毛、バラウルの鱗・皮・角

根拠：[S02] [S04]

## 交換所：ギーナ ⇄ キューナ

交換所（Quna Exchange）はキューナとギーナをプレイヤー同士で交換する場所です。NC は出品も購入も行いません。

1. 売り手が物質変換で **ギーナ箱**（40万・200万・1,000万ギーナの3種）を作る。
2. 交換所に出品し、キューナの価格を自分で決める。
3. 買い手がキューナで購入する。レートは需給で変動する。

出品・購入のどちらにもメンバーシップが必要です。交換で得たキューナはショップやパスなどすべてのキューナ商品に使えます。根拠：[S01] [S03] [S07]

## 信頼ステータス

ギーナ表示の横にある信頼度のアイコンは、交換所で買えるギーナの量と取引所の1日の精算額に影響します。不審な行動や RMT で下がる可能性があります。詳細は [[trading-rules]] を参照。根拠：[S02]

## 使う前のチェックリスト

- [ ] Lv45 に到達した
- [ ] 取引所を使うサーバーでメンバーシップを有効化した
- [ ] 売る装備を装着していない
- [ ] 出品前に 28 日間の取引履歴を見た
- [ ] 売上は「精算」タブで受け取る
