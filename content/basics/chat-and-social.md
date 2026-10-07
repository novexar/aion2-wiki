---
id: chat-and-social
title: チャットとフレンド
reading: ちゃっととふれんど
category: basics
tags: [チャット, フレンド, ブロック, 自動翻訳, 社交]
summary: 陣営チャットはLv30から。耳打ちとフレンドは同じ陣営・同じサーバーグループが条件。チャット設定で11種類の表示切替、ブロックリスト、自動翻訳を使える。
confidence: community
region: global
updated: 2026-10-08
aliases: [Chat, フレンド, Friends, ブロックリスト, Block List, 耳打ち, Whisper, 自動翻訳, 陣営チャット, ブロック]
related: [controls-and-keybinds, party-and-matchmaking, legion, recommended-settings, regions-and-servers]
sources:
  - id: S01
    title: Aion 2 Maps：Chat commands and controls
    url: https://aion2maps.com/guides/commands-and-controls/
    date: 2026-09-28
    kind: guide
  - id: S02
    title: Aion 2 Maps：Launch dates, packs and servers
    url: https://aion2maps.com/guides/launch-info/
    date: 2026-10-05
    kind: guide
  - id: S03
    title: AION2 Times：AION2の設定おすすめ｜画質とチャット・HUD
    url: https://aion2-times.com/aion2-settings-guide/
    date: 2026-10-06
    kind: guide
  - id: S04
    title: AION2 Times：よくある質問
    url: https://aion2-times.com/aion2-faq/
    date: 2026-10-06
    kind: guide
  - id: S05
    title: games.gg：Aion 2 Guide - How to Add Friends & Accept Requests
    url: https://games.gg/aion-2/guides/aion-2-how-to-add-friends/
    date: 2026-10-08
    kind: guide
---

> **要確認**：チャット設定（11種類の表示切替、ブロックリスト、自動翻訳）は AION2 Times、フレンド管理が Esc メニューにある点は games.gg でも確認できます。ただし、陣営チャットのLv30条件、各チャンネルのコマンド、耳打ちとフレンドの「同じサーバーグループ」条件は Aion 2 Maps（クライアント解析）のみの記述です。games.gg は「サーバーをまたいだフレンド追加ができる」とも書いており、サーバーグループの範囲との関係は未確定です。ゲーム内の表示が優先されます。

AION2 のチャットは、チャンネルごとに「/」付きのコマンドで切り替えます。フレンドや耳打ちには、陣営とサーバーの制限があります。この記事では、チャンネル、フレンド、ブロック、自動翻訳の基本をまとめます。コマンドの全一覧は [[controls-and-keybinds]] にあります。

根拠：[S01] [S02] [S03]

## チャットのチャンネル

| コマンド | チャンネル | 条件 |
| --- | --- | --- |
| /s | 一般 | なし |
| /t | 陣営 | Lv30（クライアント解析） |
| /w | 耳打ち | 相手が同じサーバーグループにいる |
| /h | 叫び | なし |
| /p | パーティ | パーティ所属 |
| /f | フォース | フォース所属 |
| /l | レギオン | レギオン所属 |
| /d | ダンジョン | ダンジョングループ所属 |
| /r | 直前の耳打ちに返信 | — |

1通は100文字までです。Ctrl + 左クリックでアイテムやマップピンを共有でき、1通に5個まで貼れます。チャットの欄は初期キー Enter で開きます。

根拠：[S01]

## フレンドと耳打ち

| 項目 | 内容 |
| --- | --- |
| フレンド管理 | Esc メニューの「アクティビティ → フレンド管理」（games.gg [S05]）。フレンド上限は50人（同） |
| 陣営 | フレンドは同じ陣営同士のみ |
| 別サーバー | 別のサーバーグループのキャラには、フレンド申請、耳打ち、パーティ招待が断られる |
| 同じリージョンの別サーバー | ダンジョンは全サーバーを横断してマッチングされる。遊ぶ相手と同じサーバーグループかどうかは事前に確認する |
| 逆の陣営 | パーティに招待できるのはダンジョン内のみ。ダンジョン外のパーティでは、相手のチャットは判読できない言語で表示される（アジア版の報告） |

フレンドと同じサーバーで遊びたいときは、キャラクターを作る前にサーバーと種族をそろえます。詳しくは [[regions-and-servers]] を参照してください。

根拠：[S01] [S02] [S05]

## チャット設定

設定画面のチャット設定は、「基本設定」と「ブロックリスト」の2つに分かれています。

| 設定 | 内容 |
| --- | --- |
| チャットの種類 | 一般・種族・パーティ・レギオンなど11種類を、種類ごとに表示するか決める |
| 戦闘ログ | ダメージ、回復、バフ／デバフ、システム通知の表示を切替 |
| 時刻表示 | 現地時刻[LT]かサーバー時刻[ST]かを選ぶ |
| 自動翻訳 | オン／オフ。オンにすると外国語の書き込みも日本語で流れ、チャット量が増える |
| ブロックリスト | 見たくない相手をブロックする |

自動翻訳と、見ないチャンネルの非表示は、始めた日に決めておくのがおすすめです。種族チャットは荒れやすい、という指摘もあります。HUD の配置とチャットの文字サイズは HUD 編集で変えられます（[[recommended-settings]]）。

根拠：[S03]

## 困ったとき

| 症状 | 対処 |
| --- | --- |
| チャットが表示されなくなった（「しばらくしてからもう一度お試しください」と出る） | キャラクターを切り替える、ローディング画面が出るエリアへ移動する、再ログインする。直る場合がある |
| 迷惑行為 | 対象を選んで「報告」を選ぶ。報告の累積結果は、チャット禁止から停止まで。詳細は [[rules-and-policies]] |

根拠：[S01] [S04]

## 関連

- パーティの組み方は [[party-and-matchmaking]]、レギオンのチャットは [[legion]]。
