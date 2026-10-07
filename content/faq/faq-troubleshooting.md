---
id: faq-troubleshooting
title: FAQ：トラブル（キュー・ログイン・Drops未着・アーリーアクセス消失）
category: faq
tags: [FAQ, トラブル, ログイン, Twitch Drops, アカウント連携, 不具合]
summary: アカウント連携でアーリーアクセスの権利を失う問題、Twitch Dropsが届かない時、使命タブの既知の不具合、チャットが出ない時の対処など、開始直後に多いトラブルに短く答える。
confidence: community
region: global
updated: 2026-10-08
aliases: [トラブル FAQ, ログインできない, Drops 届かない, アカウント連携 失敗, 使命 開けない]
related: [known-issues, launch-rewards-and-codes, nc-account-and-purple-setup, steam-vs-purple, regions-and-servers, rules-and-policies, duty-quests]
sources:
  - id: S01
    title: mein-mmo：Aion 2 Early Access Zugang verloren
    url: https://mein-mmo.de/aion2-early-access-zugang-verloren/
    date: 2026-10-02
    kind: guide
  - id: S02
    title: redfreshet：【AION2】Twitch Drops最新報酬一覧｜受け取り方・連携できない時の対処
    url: https://redfreshet.com/aion2-twitch-drops/
    date: 2026-10-06
    kind: guide
  - id: S03
    title: AION2HUB：AION 2 Global Patch Notes — October 5, 2026
    url: https://aion2hub.com/updates/aion-2-global-update-2026-10-05
    date: 2026-10-05
    kind: guide
  - id: S04
    title: AION2 Times：AION2 よくある質問まとめ
    url: https://aion2-times.com/aion2-faq/
    date: 2026-10-06
    kind: guide
  - id: S05
    title: Aion 2 Maps：Daily and weekly
    url: https://aion2maps.com/guides/daily-and-weekly/
    date: 2026-10-05
    kind: guide
---

> **要確認**：Twitch Drops は「実際に遊ぶアカウントに連携する」点が redfreshet と Aion 2 Maps で、使命タブをLv45前に開かない回避策が AION2HUB と Aion 2 Maps で一致しています。一方、アーリーアクセス権の消失（MeinMMO のみ）、サーバー選択画面に戻るまでの時間の延長（AION2HUB のパッチノートのみ）、チャット不具合・取引所・外見変更券（AION2 Times のみ）は、それぞれ1資料だけが根拠で、NC公式告知の本文は取得できませんでした。不具合は修正や告知で変わるので、最新の状況は公式のお知らせと [[known-issues]] を確認してください。

開始直後に多いトラブルと対処をまとめました。

## Q. アーリーアクセスの権利やキャラクターが見えなくなった

Steam で初めて起動した時に、NC アカウントの連携がないと、NC 側で仮のアカウントが自動で作られます。あとから仮のアカウントを外して本来の NC アカウントをつなぎ直すと、ファウンダーズパックの権利が仮のアカウントに残り、アクセスできなくなる報告があります。Twitch Drops のために NC のサイトで連携した時に起きた例が目立ちます。

対処の目安は次のとおりです。

1. ログインの方法を変えただけなら、アカウント設定で連携を外し、正しい組み合わせで連携し直せることが多い。
2. 仮のアカウントを外してしまった場合は、自力で戻せないことがある。NC の公式サポートに連絡して待つ。
3. 迷ったら、連携を繰り返さない。

根拠：[S01]

## Q. Twitch Drops が届かない

まず、Twitch と「実際に遊んでいるアカウント」が連携しているか確認します。Steam 版なら Steam アカウント、PURPLE 版なら NC（PURPLE）アカウントです。別の Steam アカウントを連携すると、Twitch では獲得できてもキャラクターに届きません。

- Twitch の Drops の画面で「受け取る」まで押したか確認する。進捗100%だけでは受け取りが終わっていない。
- 複数の Twitch アカウントがある場合、AION2 と連携したものと同じか確認する。
- 届かないからといって、NC の公式サイトで別のアカウントを連携し直さない。既存の接続が外れ、キャラクターに入れなくなる恐れがある（公式の警告）。
- それでも解決しない場合は、連携を繰り返さず、公式サポートへ連絡する。

期限などは [[launch-rewards-and-codes]] にまとめています。

根拠：[S02]

## Q. ジャーナルの「使命」タブを開いたら、Lv45で使命が使えない

既知の不具合です。Lv45に達する前に「使命（Duty）」タブを開くと、Lv45到達後も翌日のリセットまで使命が解放されません。Lv45になるまで、タブに触らないのが回避策です。使命は1日5件の大切な日課なので注意してください。詳しくは [[known-issues]] と [[duty-quests]]。

根拠：[S03] [S05]

## Q. サーバー選択画面に戻されてしまう

何も操作しないと、サーバー選択画面へ戻されるまでの時間は、2026年10月5日のメンテナンスで30分から3時間に延びました。

根拠：[S03]

## Q. チャットが表示されなくなった

メッセージを送ると「しばらくしてからもう一度お試しください」と出て、自分と他人のメッセージが両方見えなくなる不具合です。キャラクターを切り替える、ローディング画面が出るエリアへ移動する、再ログインのいずれかで直る場合があります。

根拠：[S04]

## Q. 取引所で出品も購入もできない

取引所は、クァイリン特級メンバーシップに加入していないと使えない、と案内されています。メンバーシップの効果は購入したサーバーのキャラクターにだけ付くので、取引所を使うキャラクターがいるサーバーで加入してください。詳しくは [[faq-membership-and-pass]] と [[market-and-exchange]]。

根拠：[S04]

## Q. 外見変更券を受け取り損ねた

10月4日の生放送を記念して、アジアリージョンの全員に「キャラクター外見変更券（7日）」が1個配られ、10月11日（日）23:59まで受け取れます。アイテムに7日の期限があるため、受け取ったら早めに使ってください。

根拠：[S04]

## Q. War For Atreia の Drops が見つからない

通常の AION2 配信とは、対象のチャンネルが異なります。獲得した後は、Twitch の Drops インベントリから「受け取る」期限もあるため、後回しにしないでください。

根拠：[S02]

## Q. ギーナ（刻印）が倉庫に預けられない

仕様です。ギーナ（刻印）は、キャラクター倉庫にもサーバー倉庫にも預けられません。詳しくは [[faq-economy]]。

根拠：[S04]
