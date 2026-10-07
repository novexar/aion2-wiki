---
id: party-and-matchmaking
title: パーティとマッチング（サーバー横断・陣営混在・貢献度）
category: basics
tags: [パーティ, マッチング, ダンジョン, フォース, 初心者]
summary: 遠征は最大 5 人、超越は 2〜5 人、聖域は 10 人。グローバル版はリージョン内の全サーバー・両陣営でマッチングでき、「自陣営のみ」の設定も選べます。募集の見方と貢献度の注意点をまとめます。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Party, Matchmaking, Group finder, パーティ募集, フォース, Force, 貢献度, Contribution, クロスサーバー, LFG]
related: [party-roles-and-buffs, legion, chat-and-social, death-and-resurrection]
sources:
  - id: S01
    title: Aion 2 Maps：Dungeons and raids
    url: https://aion2maps.com/guides/dungeons-and-raids/
    date: 2026-10-04
    kind: guide
  - id: S02
    title: Aion 2 Maps：Launch dates, packs and servers（Playing with friends on other servers の節）
    url: https://aion2maps.com/guides/launch-info/
    date: 2026-10-05
    kind: guide
  - id: S03
    title: Aion 2 Maps：Chat commands and controls（パーティ・フォースのコマンド）
    url: https://aion2maps.com/guides/commands-and-controls/
    date: 2026-10-05
    kind: guide
  - id: S04
    title: AION2 Times：よくある質問まとめ（貢献度・バス）
    url: https://aion2-times.com/aion2-faq/
    date: 2026-10-06
    kind: guide
  - id: S05
    title: AION2 Times：レギオン(ギルド)解説（パーティとフォースの人数）
    url: https://aion2-times.com/aion2-legion-guide/
    date: 2026-10-02
    kind: guide
  - id: S06
    title: Aion2 Guide (aion2.run)：Game systems explained（Group finder の項）
    url: https://aion2.run/en/systemes
    date: 2026-10-05
    kind: guide
---

AION2 のパーティコンテンツは「固定の仲間がいなくても遊べる」設計です。グローバル版では、ダンジョンのマッチングが **同じリージョン内のすべてのサーバー・両陣営** を対象にしており、「自陣営のみ」のオプションも用意されています。友人と別サーバーでも、同じリージョンならダンジョンは一緒に遊べます。

根拠：[S01] [S02]

## 人数の基本

| コンテンツ | 人数 |
| --- | --- |
| 遠征（Expedition） | 1〜5 人（ダンジョンにより最少 2 人） |
| 超越（Transcendence） | 2〜5 人 |
| 聖域（Sanctuary、ルドラ） | 10 人（5 人パーティ × 2） |
| 悪夢・覚醒戦 | 1 人（ソロ専用） |
| 闘技場・戦場 | 1 人でキューに入る（パーティでの申請は不可） |

パーティは最大 5 人、フォース（Force）は最大 4 パーティ・20 人をまとめる大人数向けの仕組みです。フォースのままでは普段のダンジョンには入れず、主にアビスやフィールドボス向けです。

根拠：[S01] [S02] [S05]

## マッチングの範囲（グローバル版）

| 相手 | 一緒にできること |
| --- | --- |
| 同じリージョンの別サーバーの友人 | ダンジョン（遠征・超越・聖域）はすべて可能 |
| 別の陣営（天族⇔魔族） | ダンジョン内のパーティのみ可能。ダンジョン外では相手のチャットが読めない言語として表示される |
| 別のリージョン | 不可。キャラクターをリージョン間で移動することもできない |

- 募集部屋はリーダーが「同じ陣営のみ」に設定でき、部屋一覧には「自陣営」フィルタがあります。
- フレンド登録とウィスパーは同じ陣営・同じサーバーグループに限られます。
- 正式サービス開始後は、アーリーアクセスサーバーとローンチサーバーが同じプールでマッチングされます。

根拠：[S02] [S01]

## パーティの作り方・入り方

1. 遠征などのコンテンツ画面から募集一覧を開く。
2. 目的（初見・練習・周回など）とアイテムレベル／戦闘力の条件を確認して参加申請する。
3. 自分で部屋を作る場合は、目的を部屋名に書く。
4. チャットコマンドでも操作できる（下表）。

| 操作 | パーティ | フォース |
| --- | --- | --- |
| 招待 | /invite、/inv | — |
| 作成 | /pform | /fform |
| 離脱 | /pquit | /fquit |
| 除名（投票） | /pkick | /fkick |
| リーダー委譲 | /pleader | /fleader |
| 募集 | /prally | /frally |
| パーティをフォースに変換 | — | /fchange |

除名はリーダー（フォースではリーダーと副リーダー）だけが投票を始められ、ボス戦中は始められません。

根拠：[S03]

## 募集で見られる数値：IL と戦闘力

募集条件には「アイテムレベル（IL）」と「戦闘力（Combat Power）」の 2 種類が使われます。コンテンツの入場条件は IL ですが、野良の募集は戦闘力を見ることが多いと攻略サイトは指摘しています。自分がどちらを満たしているか、募集文を読んでから申請してください。詳しくは [[item-level-and-combat-power]] を参照してください。

根拠：[S06]

## 貢献度（Contribution）

遠征・超越では、パーティ内での活躍度「貢献度」が一定以上ないと報酬キューブを受け取れません。寄生プレイ（「バス」に乗って何もしない）対策の仕組みです。

> **韓国版のみ**：韓国版では 2026 年 8 月 12 日のアップデートで最低条件が 1% から 5% に引き上げられました。グローバル版の具体的な閾値は、ゲーム内の説明で確認してください。

「バス」とは、上級者に高難度コンテンツへ運んでもらう文化のことです。グローバル版でも募集文に「carry」などの表記で見かけますが、全部バス頼みにすると操作が身につかず後で詰まる、という注意が韓国の攻略でも繰り返されています。

根拠：[S04]

## パーティ内のマナー・小技

- 報酬キューブを受け取らずに退出すると、週の未受取枠を消費します（[[odyle-energy]] 参照）。
- レイドマーカーはテンキーの 1〜9 で対象に付けられます。
- 「衝撃解除」はジャンプと同じキーなので、戦闘中の誤爆に注意（[[status-effects-and-cc]]）。
- 役割の組み合わせ（テンプラーとグラディエーターのバフは重複しない等）は [[party-roles-and-buffs]] を参照してください。

根拠：[S03]

## 関連記事

- [[party-roles-and-buffs]]：タンク・ヒーラー・DPS の役割とバフの重複
- [[legion]]：固定メンバーを探すならレギオン
- [[chat-and-social]]：チャットチャンネルとフレンド
