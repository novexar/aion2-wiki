---
id: steam-vs-purple
title: Steam版とPURPLE版
reading: Steamばんとぱーぷるばん
category: basics
tags: [基本情報, Steam, PURPLE, アカウント]
summary: Steam 版と PURPLE 版はゲーム内容もサーバーも同じで、一緒に遊べる。Steam だけで遊ぶなら連携不要。両方で同じキャラを使うには NC アカウントに Steam を連携する。韓国・台湾版からの引き継ぎは不可。
confidence: official
region: global
updated: 2026-10-08
aliases: [Steam版, PURPLE版, パープル, ランチャー, アカウント連携, Steam版とPURPLE版の違い]
related: [nc-account-and-purple-setup, platforms-and-requirements, regions-and-servers]
sources:
  - id: S01
    title: redfreshet：Steam版とPURPLE版の違い
    url: https://redfreshet.com/aion2-steam-purple-difference/
    date: 2026-10-06
    kind: guide
  - id: S02
    title: NC（PURPLE Lounge）：Launch FAQ
    url: https://lounge.plaync.com/feed/82939?country=US&locale=en-US
    date: 2026-10-05
    kind: official
  - id: S03
    title: AION2 Times：NCアカウントとPURPLEの始め方
    url: https://aion2-times.com/aion2-nc-account-purple-setup/
    date: 2026-10-06
    kind: guide
  - id: S04
    title: あせろぐ：AION2 アーリーアクセスと正式サービスの日程・始め方
    url: https://asellog.com/aion2-launch/
    date: 2026-09-30
    kind: guide
---

AION2 グローバル版は **Steam** と、NC 独自のランチャー **PURPLE** のどちらからでも遊べます。NC の Launch FAQ は「Steam と PURPLE でゲーム内容に違いはなく、同じサーバーを共有する」と明記しています。どちらを選んでも一緒に遊べるので、ランチャー選びより「リージョン・陣営・サーバーを友人と合わせる」ほうが重要です。

根拠：[S01] [S02]

## 比較表

| 比較項目 | Steam 版 | PURPLE 版 |
| --- | --- | --- |
| ゲーム内容 | 同じ | 同じ |
| 接続サーバー | 共通 | 共通 |
| Steam・PURPLE 間のマルチプレイ | 可能 | 可能 |
| 起動 | Steam から | PURPLE から |
| 新規プレイ | Steam アカウントだけで開始可 | NC アカウント、または Steam / Google / Apple などで開始可 |
| 事前のアカウント連携 | Steam だけで遊ぶなら不要 | PURPLE だけで遊ぶなら Steam 連携不要 |
| 同じキャラを両方で使う | 連携すれば可能 | 連携すれば可能 |
| ショップの支払い | Steam ウォレット | クレジットカード、PayPay、キャリア決済など（Xsolla 経由） |
| 韓国・台湾版からの引き継ぎ | 不可 | 不可 |
| 対応環境 | Windows PC | Windows PC |

根拠：[S01] [S02] [S03]

## どちらで始めるべきか

- **普段から Steam を使っているなら Steam 版** が分かりやすいです。Steam のフレンド・オーバーレイ・Steam Input（パッド設定）が使えます。
- **ほかの NC タイトルで PURPLE を使っているなら PURPLE 版** でも不利はありません。
- 動作の軽さやフレームレートに公式に示された差はありません。重い場合はランチャーではなく、PC スペック・グラフィック設定・ドライバーを見直してください。

根拠：[S01] [S03]

## 同じキャラクターを両方で使う仕組み

キャラクターは「作ったときに使っていた NC アカウント」に保存されます。Steam で始めた場合も、Steam アカウントとつながった NC アカウントに保存されています。両方から同じ NC アカウントに入れるようにすれば、同じキャラクターで遊べます。これは「セーブデータをコピーする」仕組みではなく、同じアカウントへ別の起動方法からアクセスする、と考えてください。

根拠：[S01] [S03]

| やりたいこと | 方法 |
| --- | --- |
| Steam で作ったキャラを PURPLE で使う | PURPLE を起動し、ログイン方法で「Steam」を選び、キャラを作った Steam アカウントでログインする |
| PURPLE で作ったキャラを Steam で使う（Steam ログインで PURPLE を使っていた場合） | 同じ Steam アカウントで Steam 版を起動する |
| PURPLE で作ったキャラを Steam で使う（NC アカウントなどでログインしていた場合） | NC 公式サイトの「マイページ」→「ログイン管理」で、キャラのある NC アカウントに Steam を連携してから Steam 版を起動する |

根拠：[S01] [S03] [S04]

> **注意**：先に Steam アカウントで PURPLE や公式サイトにログインすると、Steam 用の **別の NC アカウント** が自動で作られます。既存キャラのある NC アカウントで遊びたい人は、Steam でログインする前に、公式サイトで既存アカウントに Steam を連携してください。手順の詳細と「アカウント連携失敗」の対処は [[nc-account-and-purple-setup]] を参照してください。

根拠：[S03] [S04]

## 連携を付け替えてもキャラは移動しない

キャラクターやゲームデータは、作成時の NC アカウント側に紐づきます。Steam との連携を解除して別の NC アカウントへ連携し直しても、キャラは新しいアカウントへ移動しません。連携変更後にキャラが表示されなくなった場合は、新しくキャラを作る前に次を確認してください。

1. もともとどのアカウントでキャラを作ったか。
2. Steam と連携している NC アカウントが正しいか。
3. 同じリージョンを選択しているか。
4. 同じサーバーを確認しているか。

根拠：[S01] [S03]

## Twitch Drops の連携

Twitch Drops の報酬は Twitch と連携したアカウントに届きます。Steam で遊んでいるなら Steam アカウント、PURPLE で遊んでいるなら NC（PURPLE）アカウントを Twitch に連携してください。報酬が届かないからといって連携を何度も変更すると、既存キャラにアクセスできなくなる原因になります。連携状況は公式サイトの「マイページ」→「ログイン管理」で確認できます。

根拠：[S01] [S02] [S03]

## 課金はプラットフォームごとに別

Steam と PURPLE で同じキャラにアクセスできることと、各ストアで購入した商品・決済情報が共通になることは別です。ファウンダーズパックは買ったプラットフォームでのみ使えました。課金するときは、今どちらから遊んでいるかと、購入画面の対象アカウントを確認してから決済してください。

根拠：[S01] [S04]

## 韓国・台湾版からの引き継ぎはできない

NC の Launch FAQ は「台湾版・韓国版の進行はグローバル版に引き継がれない」と明記しています。「Steam と PURPLE の共有」と「韓国・台湾版からの移行」は別の話です。

根拠：[S02]

## よくある質問

- **Steam と PURPLE のプレイヤーは一緒に遊べる？** 遊べます。同じサーバーです。
- **Steam だけで始めるなら PURPLE 連携は必要？** 不要です。両方から同じキャラを使いたいときだけ連携します。
- **Steam 起動時に「1138:100134」エラーが出る** Steam を終了し、管理者として実行し直してから起動してください。

根拠：[S01] [S02] [S03]
