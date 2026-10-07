---
id: trading-rules
title: 取引ルール
reading: とりひきるーる
category: economy
tags: [取引, 直接取引, RMT, BOT, サーバー倉庫, 信頼ステータス]
summary: グローバル版ではプレイヤー間の直接取引が BOT 対策で無効化されている。他人と物をやり取りする手段、自分のキャラ間の移動（サーバー倉庫）、RMT や代行の罰則、信頼ステータス。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Personal Trade, Direct Trade, 個人取引, RMT, Trust Status, 信頼ステータス, 業者, 直接取引の無効化]
related: [market-and-exchange, kina-and-bound-kina, storage-and-cube, whats-bound, rules-and-policies, membership]
sources:
  - id: S01
    title: AION2 Hub：Launch Scale Test Ends — Trading Off, Priority Queue（NC 9/19 告知の要約）
    url: https://aion2hub.com/news/aion-2-launch-scale-test-ends-trading-disabled-priority-queue
    date: 2026-09-19
    kind: guide
  - id: S02
    title: NC：Team Update — Business Model, Our Approach
    url: https://aion2.plaync.com/en-us/board/notice/view?articleId=6a4d7d47a729ca5877f5e1ef
    date: 2026-07-08
    kind: official
  - id: S03
    title: Aion 2 Maps：What's tied to your character, server or account
    url: https://aion2maps.com/guides/whats-bound/
    date: 2026-10-04
    kind: guide
  - id: S04
    title: Aion 2 Maps：Rules and policies
    url: https://aion2maps.com/guides/rules-and-policies/
    date: 2026-10-04
    kind: guide
  - id: S05
    title: Aion 2 Maps：Membership, Founder's Packs and the shop
    url: https://aion2maps.com/guides/membership-and-shop/
    date: 2026-10-01
    kind: guide
  - id: S06
    title: AION2 Times：取引所とお金の基礎
    url: https://aion2-times.com/aion2-exchange-money-basics/
    date: 2026-10-06
    kind: guide
  - id: S07
    title: Aion 2 Maps：Storage
    url: https://aion2maps.com/guides/storage/
    date: 2026-10-04
    kind: guide
---

「友達に装備を渡したい」「サブで拾った素材をメインに送りたい」。MMORPG では当たり前の操作ですが、AION2 グローバル版には **他のプレイヤーへ直接アイテムを渡す機能がありません**。ここでは何ができて何ができないかを整理します。

## 直接取引は無効

NC は 2026年9月19日、Launch Scale Test 終了の告知で「BOT 対策として、プレイヤー間の直接取引は無効化する。取引所がプレイヤー間取引の中心である」と明記しました。期間や解除予定の記載はなく、テスト限定の措置ではありません。根拠：[S01]

メンバーシップの商品説明には「個人取引（1日5回）」が特典として残っていますが、グローバル版のクライアントにはこの特典がありません。**友人と取引するためにメンバーシップを買っても使えません**。根拠：[S05]

| やりたいこと | 可否 | 代わりの手段 |
| --- | --- | --- |
| 他プレイヤーに装備・素材を手渡し | 不可 | 取引所に出品してもらい、買う |
| 他プレイヤーにギーナを渡す | 不可 | 取引所経由（実質的に不可能） |
| 自分の別キャラ（同サーバー）へ移動 | 可 | サーバー倉庫 |
| 自分の別アカウントへ移動 | 不可 | なし。NC は別サーバーのプレイヤーとのアイテム取引を RMT とみなす |
| パーティでドロップを分ける | 拾った人のもの | 取引可能品なら取引所へ |

根拠：[S01] [S03] [S05]

## 自分のキャラクター間の移動

同じサーバーの自分のキャラクター同士なら、**サーバー倉庫** でアイテムと通常ギーナを移動できます。

- 刻印ギーナ、ディーヴァニオン結晶、知恵の石、購入したオードエネルギー、装備変更券、復活の精霊石、外形・翼・ペット・タイトルは預けられない。
- 「(刻印)」付きでも預けられるものがある（ポーション、スクロール、パワーシャード、帰還スクロールなど）。アイテムの説明に「サーバー倉庫に保管可能／不可」と書かれている。
- ダンジョン装備は取得時に帰属するため移動できない。

根拠：[S03] [S07]

倉庫 NPC は無料で使えます。遠隔倉庫（キューブからどこでも倉庫を開く）はメンバーシップ特典です。詳細は [[storage-and-cube]] を参照。根拠：[S07]

## RMT・代行の罰則

グローバル版の運営ポリシー（2026-09-17 施行）では次のように定められています。

| 行為 | 罰則 |
| --- | --- |
| 不正プログラム、BOT、未承認の機器、ゴールドファーミング | 初回から NC 全ゲームの統合アカウント停止 |
| RMT（有料の代行・ブースト、別サーバーのプレイヤーとのアイテム取引を含む） | 30日、次に90日。未遂は 3→7→30日。アカウント取引は 7→30→90日 |
| 取引所の登録・支払い・取り消しの悪用 | 統合アカウント停止 |

根拠：[S04]

NC は「非正規な第三者サービスを通じた不正購入」への警告も出しており、業者からギーナやキューナを買うと利用停止の対象になります。根拠：[S06]

## 信頼ステータス

NC は各アカウントに「信頼ステータス」を付与し、これがないアカウントは取引所や交換所の利用を制限されることがあります。不審な行動、不正ソフト、RMT、BOT、未対応地域からのプレイ、VPN の使用などで変更・剥奪されます。定期的に見直され、理由なく失った場合は再審査を申請できます。ゲーム内ではギーナ表示の横のアイコンで段階が分かり、交換所で買えるギーナの量や取引所の1日の精算額に影響します。根拠：[S04] [S5]

## 復旧できない操作

NC のサポートが元に戻してくれない操作があります。製作ミス、強化失敗、取引所・補給依頼の操作ミス、ペットの再抽選、レギオン解散、翼・アルカナの抽出などです。出品価格の桁間違いは自己責任なので、出品前に確認してください。根拠：[S04]

## 実用的なまとめ

1. 友人とのアイテム交換はできない前提で遊ぶ。
2. サブキャラの稼ぎは **通常ギーナと取引可能素材** に限ってサーバー倉庫で集約する。
3. 業者からの購入、代行の売買、別アカウントへの移動は停止対象。
4. 信頼ステータスは VPN でも下がる可能性がある。
