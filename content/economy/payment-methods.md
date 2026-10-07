---
id: payment-methods
title: 決済方法
reading: けっさいほうほう
category: economy
tags: [決済, PURPLE, 3Dセキュア, Apple Pay, 返金]
summary: 日本のPC版PURPLEで使えるのはクレジット／デビットカード、BitCash、PayPay、キャリア決済（docomo・softbank）。コンビニ決済は終了。初回カード決済は3Dセキュアの確認があり、Apple Payは日本が対象外。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Payment methods, Xsolla, 3D Secure, 3Dセキュア, PayPay, Bitcash, キャリア決済, コンビニ決済, Apple Pay, Cash App Pay, 返金, 未成年, PURPLEのカード, Apple Payの対象外]
related: [quna, membership, founders-packs, steam-vs-purple, nc-account-and-purple-setup, free-to-play-and-p2w, cash-shop-and-cosmetics]
sources:
  - id: S01
    title: AION2 Times：PURPLEの決済方法
    url: https://aion2-times.com/aion2-purple-payment-methods-change/
    date: 2026-10-02
    kind: guide
  - id: S02
    title: AION2 Hub：Apple Pay and Cash App Pay
    url: https://aion2hub.com/news/aion-2-apple-pay-cash-app-pay-payment-methods
    date: 2026-09-16
    kind: guide
  - id: S03
    title: AION2 Hub：One-Time Card Check (3D Secure)
    url: https://aion2hub.com/news/aion-2-payment-verification-3d-secure
    date: 2026-07-30
    kind: guide
  - id: S04
    title: あせろぐ：AION2 の課金とメンバーシップ
    url: https://asellog.com/aion2-membership/
    date: 2026-09-30
    kind: guide
---

AION2 でお金を払うのは、メンバーシップ、キューナ、ファウンダーズパックなどを買うときです。支払い手段は、**どこで買うか**（PURPLE か Steam）で変わります。この記事では、日本から NC の PC ランチャー PURPLE で買う場合を中心に、使える手段と、初回に出る確認の流れをまとめます。（アカウントの作り方は [[nc-account-and-purple-setup]]）

## PURPLE で使える手段（日本）

| 手段 | 状況 |
| --- | --- |
| クレジットカード・デビットカード | 使える |
| BitCash | 使える |
| PayPay | 使える |
| キャリア決済（docomo・softbank） | 2026年9月2日から追加 |
| キャリア決済（au） | 公式の案内では「準備中」。使えるかは購入画面で確認 |
| コンビニ決済 | 2026年9月2日で終了 |
| Apple Pay | 9月23日に追加されたが、対象の56か国・地域に**日本は含まれない** |
| Cash App Pay | 米国のみ |

根拠：[S01] [S02] [S04]

> **注意**：Steam 版は Steam ウォレットなど Steam の決済手段を使います。PURPLE の変更の影響は受けません。Apple Pay と Cash App Pay が Steam でも使えるのかは、公式告知に書かれていません。根拠：[S01] [S02]

## 初回のカード認証（3Dセキュア）

最初のカード決済では、カード会社や決済会社 Xsolla の方針により、**一度だけ本人確認**が求められる場合があります。Visa、Mastercard、AMEX、JCB の利用者は、カード会社の3Dセキュアのページへ移動します。

流れは次の通りです。

1. 決済会社がカードに小額の「仮の請求（保留）」をかける。
2. 銀行アプリ、ネットバンク、SMS、メールで、その保留金額を見る。
3. 画面にその金額を入力する。

守るべき制限は次の通りです。

| 項目 | 内容 |
| --- | --- |
| 入力回数 | 合計3回まで。3回間違えると、不正検知システムが自動で決済を取り消す |
| 有効時間 | 金額の有効期間は3時間。過ぎたら新しい決済からやり直し |
| 保留金額 | 成功すると即時に取り消され返金される。使われなかった保留も3時間で自動取消 |
| 対応カード | デビットカードは可（残高が必要）。ギフトカード・プリペイドカードは不可 |
| 通貨のずれ | 保留がUSD以外の通貨で入った場合は、認証画面のプルダウンで通貨を選ぶ |

認証後は、次回から速く決済できるとされます。うまくいかない場合は、AION2 のサポートではなく Xsolla のカスタマーサポートが窓口です。先に銀行の通知画面を開いて確認できる状態にしてから決済を始めるのが安全です。根拠：[S03] [S04]

## 購入条件・返金

| 項目 | 内容 |
| --- | --- |
| 支払い | 即時払い（現金またはキューナの消費） |
| 商品の提供 | 購入確定後72時間以内 |
| 返品・払い戻し | 原則できない。キューナに有効期限はない |
| ファウンダーズパック | 正式サービス前は返金可、サービス後は14日以内かつ2時間未満のプレイなどの条件付き（[[founders-packs]]） |

根拠：[S01] [S04]

## 未成年の購入上限

| 年齢 | 1か月にキューナを買える金額 |
| --- | --- |
| 15歳以下 | 5,000円まで |
| 16〜19歳 | 20,000円まで |
| 20歳以上 | 上限なし |

根拠：[S04]

## 注意

- 期間限定の試験運営（Launch Scale Test、9月17〜19日）では、ショップ、キューナ、パス、メンバーシップ、すべての決済機能が止まっていました。
- 運営が認めていない第三者からギーナやキューナを買うのは規約違反で、アクセス制限や利用停止の対象です。（[[trading-rules]]）
- キューナの価格は [[quna]]、メンバーシップは [[membership]] を見てください。

根拠：[S01]
