---
id: known-issues
title: 既知の不具合と回避策
reading: きちのふぐあいとかいひさく
category: news
order: 184
tags: [不具合, 既知の問題, 回避策, 使命, Twitch]
summary: 正式サービス開始時点で公式が認めている不具合と、その回避策。特に「Lv45前に使命タブを開くと翌日まで使命が使えない」問題は新規プレイヤー全員に関係する。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Known Issues, バグ, 不具合一覧, チャットなど]
related: [global-patch-notes, twitch-linking-pitfalls, duty-quests, chat-and-social]
sources:
  - id: S01
    title: AION2 Hub：AION 2 Global Patch Notes — October 5, 2026（公式告知の英訳。使命タブの回避策を記載）
    url: https://aion2hub.com/updates/aion-2-global-update-2026-10-05
    date: 2026-10-05
    kind: guide
  - id: S02
    title: Aion 2 Maps：Daily and weekly（「Lv45前に使命タブを開かない」を NC 告知として記載）
    url: https://aion2maps.com/guides/daily-and-weekly/
    date: 2026-10-04
    kind: guide
  - id: S03
    title: AION2 Hub：Early Access Fixes & Twitch Drops Account Linking（10/1・10/2 の公式告知を要約）
    url: https://aion2hub.com/news/aion-2-early-access-fixes-twitch-drops-account-linking
    date: 2026-10-02
    kind: guide
  - id: S04
    title: AION2 Times：AION2 よくある質問まとめ（チャットが表示されなくなった場合の対処）
    url: https://aion2-times.com/aion2-faq/
    date: 2026-10-06
    kind: guide
  - id: S05
    title: Aion 2 Maps：Membership, Founder's Packs and the shop（非会員の取引所出品の食い違いを記載）
    url: https://aion2maps.com/guides/membership-and-shop/
    date: 2026-10-01
    kind: guide
---

正式サービス開始直後のゲームには、公式が「修正中」と認めている不具合がいくつかあります。知らずに踏むと1日分の報酬を失うものもあるので、始める前に目を通しておくと安全です。この記事は2026年10月8日時点の情報で、修正されたものは [[global-patch-notes]] に移していきます。

根拠：[S01] [S03]

## 1. 使命（Duty）タブを Lv45 前に開くと翌日まで使えない

最も影響が大きい既知の問題です。10月5日の公式メンテナンス告知で「ジャーナル－使命コンテンツのエラーを修正中」と明記されています。

| あなたの行動 | Lv45 到達時の使命 |
| --- | --- |
| Lv45 **前**にジャーナルの「使命」タブを開いた | すぐには使えない。翌日のリセット後に解放 |
| Lv45 までタブを開かなかった | Lv45 になった瞬間から使える |

**回避策**：Lv45 になるまでジャーナルの「使命」タブに触らない。使命は1日5件の重要な日課なので、初日分を失わないように注意してください（[[duty-quests]]）。

根拠：[S01] [S02]

## 2. アカウント連携まわり（アーリーアクセス〜）

10月1日の公式告知「Update on account issues and in-game fixes」で、次の2点は修正済みとされています。

- ログイン時にアーリーアクセス権が認識されない
- ゲーム内購入ができない

同じ告知で「一部のプレイヤーにアカウント連携の問題が出ている」とも書かれており、10月2日時点では解決の告知は出ていません。

**やってはいけないこと**：Twitch Drops が届かないからといって NC 公式サイトで別アカウントを連携し直すこと。既存の連携が外れ、キャラクターにアクセスできなくなる恐れがあると公式が警告しています（[[twitch-linking-pitfalls]]）。

根拠：[S03]

## 3. チャットが表示されなくなる

メッセージを送ると「しばらくしてからもう一度お試しください」と出て、自分と他人のメッセージが両方表示されなくなる症状が報告されています。公式の修正告知は確認できていません。

**回避策**：キャラクターを切り替える、ローディング画面が出るエリアへ移動する、再ログインする、のいずれかで直る場合があります。

根拠：[S04]

## 4. 非会員の取引所「出品」が公式告知と実機で食い違う

公式告知では「非会員は出品できるが購入はできない」とされていますが、グローバル版クライアントでは非会員に出品枠が表示されないという報告があります。どちらが仕様かは未確定です。

**対処**：取引所で売りたい場合は、ゲーム内で実際に出品画面が開くかを確認してから、素材を貯め込む計画を立ててください（[[market-and-exchange]]）。

根拠：[S05]

## 5. 混雑・待機列・作成制限

不具合ではなく仕様ですが、開始直後に多く問い合わせがある項目です。

- 人気サーバーは「作成制限」になり、そのサーバーにキャラクターを持っていない人は入れません。
- 待機列は一般列と優先列（良好な状態の会員）があります。
- 10月5日のメンテナンスで、無操作時にサーバー選択画面へ戻されるまでの時間が30分から3時間に延びました。

根拠：[S01]

## 不具合を見つけたとき

1. まず公式お知らせ（ja-jp／en-us）に同じ症状の告知が無いか確認する（[[jp-official-channels]]）。
2. 復旧が必要なもの（誤削除・誤売却など）は15日以内にサポートへ申請する。強化失敗や取引所の誤操作は復旧対象外（[[rules-and-policies]]）。
3. 再現手順をメモしてから報告する。「いつ・どこで・何をしたら」が揃うと対応が早い。
