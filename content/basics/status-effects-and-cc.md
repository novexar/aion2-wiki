---
id: status-effects-and-cc
title: 状態異常
reading: じょうたいいじょう
category: basics
tags: [状態異常, CC, 衝撃解除, PvP, 戦闘]
summary: スタン・転倒・恐怖などの状態異常は3系統に分かれ、それぞれ別の抵抗値があります。全クラス共通の解除スキル「衝撃解除」の仕様と、対策の消耗品をまとめます。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Status effects, Crowd control, Defiance, 衝撃解除, スタン, 転倒, 恐怖, 束縛, Tenacity, 状態異常抵抗]
related: [stats-explained, how-damage-works, glossary, combat-basics]
sources:
  - id: S01
    title: Aion 2 Maps：PvP（Crowd control の節）
    url: https://aion2maps.com/guides/pvp/
    date: 2026-10-05
    kind: guide
  - id: S02
    title: AION 2 Global Database：グラディエーター（スキル一覧に「衝撃解除」）
    url: https://aion2.gaming.tools/ja/classes/gladiator
    date: 2026-10-05
    kind: database
  - id: S03
    title: Aion2 Guide (aion2.run)：Glossary
    url: https://aion2.run/en/lexique
    date: 2026-10-05
    kind: guide
  - id: S04
    title: Aion 2 Maps：Chat commands and controls（Defiance の既定キー）
    url: https://aion2maps.com/guides/commands-and-controls/
    date: 2026-10-05
    kind: guide
---

状態異常（Status effect／CC＝Crowd Control）は、スタンや転倒のように相手の行動を奪う効果です。PvE では敵の攻撃パターンを止める手段として、PvP では勝敗を決める要素として重要です。グローバル版では **全クラスが共通の解除スキル「衝撃解除（Defiance）」** を持ち、既定ではスペースキー（ジャンプと共用）に割り当てられています。

根拠：[S01] [S02] [S04]

## 状態異常の3系統

状態異常は3つの系統に分かれ、それぞれに対応する抵抗ステータスがあります。

| 系統 | 含まれる効果 |
| --- | --- |
| 衝撃系（Impact / Shock） | スタン、転倒（Knockdown）、打ち上げ（Airborne）、捕縛（Grab） |
| 精神系（Mental） | 封印（Seal：スキル使用不可）、恐怖（Fear）、挑発（Taunt）、変身（Polymorph） |
| 異常系（Ailment） | 束縛（Root）、減速（Slow）、無気力（Lethargy）、氷結（Frost）、暗闇（Blind）、出血（Bleed）、毒（Poison） |

モンスターにはほとんどの状態異常が確実に入りますが、プレイヤーには 30〜75% 程度（スキルのツールチップに記載）しか入りません。相手の「状態異常抵抗」が高いほど入りにくく、自分の「状態異常発動率」が高いほど入りやすくなります。

根拠：[S01]

## 衝撃解除（Defiance）の仕様

| 項目 | 内容 |
| --- | --- |
| 持っているクラス | 全 8 クラス |
| 解除できるもの | スタン、転倒、打ち上げ、捕縛、氷結、恐怖 |
| 解除できないもの | 束縛、減速、封印、暗闇、挑発、変身 |
| 使用後 | 「不屈（Tenacity）」が付き、5 秒間は状態異常を受けない。ただしノックバックと引き寄せは防げない |
| 再使用時間 | スキルレベル 10 で 51 秒。再使用時間減少の効果を受けない |
| 既定キー | スペース（ジャンプ・グライドと共用）。設定で「衝撃解除を別キーにする」を有効にできる |

> **注意**：ジャンプと同じキーなので、戦闘中にジャンプしようとして衝撃解除を無駄に消費することがあります。設定（O）→ キー設定で別キーにしておくのが無難です。

根拠：[S01] [S04]

## PvP での基本：相手に先に使わせる

PvP の駆け引きは「どちらが先に衝撃解除を使うか」で決まります。軽い状態異常で相手の衝撃解除を誘い、再使用時間中に本命の状態異常を入れるのが基本です。

- 全クラスが「状態異常抵抗」を上げるパッシブ（Survival Willpower または Revitalization Contract）を持ち、スキルレベル 10 で +35%、さらに状態異常中に被弾するたび +10%（最大 10 回、5 秒）が付きます。PvE ではレベル 1 のまま、PvP プリセットでは上げるのが一般的です。
- 無敵系スキルは互いに排他です。グラディエーターの Tenaciousness、クレリックの Salvation、チャンターの Barrier Spell のいずれかを受けると、30 秒間は他の 2 つを受けられません。

根拠：[S01]

## 対策の消耗品

| アイテム | 効果 |
| --- | --- |
| 状態異常抵抗スクロール | 60 秒間、状態異常を 1 回防ぐ |
| 上級回復ポーション | 状態異常を 2 つ解除（スタンは除く） |
| 白龍系の料理 | 状態異常抵抗 +10% |

いずれも製作で作れます。

根拠：[S01]

## ボスの「無力化」との違い

ボスの体力バーの下にある「無力化ゲージ」を削り切ると、ボスが数秒間行動不能になります。これはプレイヤー同士の状態異常とは別の仕組みで、特定のスキルだけがゲージを削ります。詳しくは [[combat-basics]] を参照してください。

根拠：[S03]

## 関連記事

- [[stats-explained]]：状態異常発動率・抵抗の計算
- [[combat-basics]]：無力化ゲージと戦闘の基本
- [[glossary]]：用語の日英対照
