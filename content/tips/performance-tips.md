---
id: performance-tips
title: 軽量化・カクつき対策
category: tips
tags: [FPS, 軽量化, グラフィック, DLSS, 動作環境]
summary: まずDLSSかFSRを有効にし、解像度スケール、大規模戦闘品質、エフェクト、影の順に下げる。街や大人数戦だけ重いなら他プレイヤーの表示を減らす。FPSが高いのにカクつくときはフレーム生成を一度切る。
confidence: verified
region: global
updated: 2026-10-08
aliases: ["Performance Tips", "軽量化", "FPS向上", "カクつき対策", "DLSS FSR 設定", "ラグ 対策"]
related: [recommended-settings, platforms-and-requirements, steam-vs-purple, controller-and-steam-deck, ui-and-menus]
sources:
  - id: S01
    title: redfreshet：AION2 おすすめ設定｜FPSを上げる軽量化・DLSS/FSR・カクつき対策
    url: https://redfreshet.com/aion2-best-graphics-settings-fps/
    date: 2026-10-07
    kind: guide
  - id: S02
    title: AION2 Times：動作スペック（PC構成の目安）
    url: https://aion2-times.com/aion2-pc-build-guide/
    date: 2026-10-05
    kind: guide
  - id: S03
    title: MeinMMO：Aion 2 Endgame - 14 Tipps
    url: https://mein-mmo.de/aion2-endgame-tipps/
    date: 2026-10-07
    kind: guide
  - id: S04
    title: AION2 Hub：Aion 2 System Requirements（Steamストア記載の動作環境・DLSS 4.5）
    url: https://aion2hub.com/guides/aion-2-system-requirements
    date: 2026-10-08
    kind: guide
  - id: S05
    title: Skycoach：AION 2 Best Settings
    url: https://skycoach.gg/blog/aion-2/articles/aion-2-best-settings
    date: 2026-10-08
    kind: guide
---

> **要確認**：動作環境の表（Steamストアの記載）とDLSS 4.5対応は AION2 Hub で、下げる順番（影・グローバルイルミネーション・反射・他プレイヤーのエフェクトが先、フレーム生成はPvE向き）は Skycoach でも確認できました。ただし設定の効果はPCの構成で変わります。1〜2項目ずつ変えて、同じ場所で確認してください。基本の設定は [[recommended-settings]] にあります。

AION2はUnreal Engine 5製で、街や大人数の戦闘では負荷が上がります。画質を全部最低にする前に、効く順に手を入れると、見た目を保ちながら軽くできます。

## 公式の動作環境

| 項目 | 最低 | 推奨 |
| --- | --- | --- |
| CPU | Ryzen 5 2600 / Core i5-10500 | Ryzen 7 3700X / Core i7-11700 |
| メモリ | 8GB | 16GB |
| GPU | GTX 1050 Ti 4GB | RTX 2070 8GB |
| ストレージ | 100GB | 100GB |

推奨環境でもフルHD・低設定が基準です。推奨を超えていても、最高設定で60FPS以上が出るとは限りません。まず低〜中で安定させてから画質を上げてください。

根拠：[S02] [S04]

→ [[platforms-and-requirements]]

## 下げる順番

1. DLSS（GeForce RTX）またはFSRを有効にする。
2. 解像度スケールを「品質」にする。足りなければ「バランス」。
3. 大規模戦闘品質を下げる。
4. エフェクト品質を下げる。
5. 他プレイヤーのエフェクト表示を減らす。
6. 影、グローバルイルミネーション、反射を下げる。
7. ボリュメトリックフォグをオフにする。
8. 視野距離、植生を下げる。
9. 対応するGPUなら、フレーム生成を試す。

一度に全部変えず、1〜2項目ずつ同じ場所でFPSを確認すると、原因が分かります。テクスチャ品質は、VRAMに余裕があれば下げてもFPSはあまり伸びません。

根拠：[S01] [S05]

## DLSSとフレーム生成

- GeForce RTXなら、アップスケーラーはDLSSがおすすめです。グローバル版はDLSS 4.5に対応します。フルHDは「品質」、WQHDや4Kは「品質〜バランス」が目安です。
- ドライバーはGame Ready Driverを新しくしておきます。
- フレーム生成（Frame Generation）は、RTX 40シリーズ以降が対象です。通常描画で十分なFPSが出ているときだけ、2倍から試します。元のFPSが低い、入力の遅れを感じる、PvPを重視するときは、オフも比べてください。
- RTX 20・30シリーズはアップスケールだけを使えます。

根拠：[S01]

## 街や大人数の戦いだけ重いとき

フィールドは快適でも、街やレイドで落ちるのは、多数のキャラクターと装備とエフェクトの処理が増えるためで、CPUの負荷も大きくなります。優先して次を下げてください。

- 大規模戦闘品質
- プレイヤーのパーティクルエフェクト（自分とパーティーを残し、他人を減らす）
- 他プレイヤーの表示負荷
- ペットの表示
- 視野距離

全部のエフェクトを消すのはおすすめしません。ボスの攻撃や、自分と仲間の攻撃範囲が見えにくくなります。他プレイヤーの分から減らしてください。

根拠：[S01]

## FPSは高いのにカクつくとき

表示上のFPSが高くても、フレームタイム（1コマの間隔）が乱れていると、滑らかに感じません。

1. フレーム生成を一度オフにして、通常描画で比べる。
2. HDDではなくSSDにインストールする。公式もSSDを推奨しています。
3. GPUドライバーを更新する。
4. ブラウザや録画・配信ソフトなど、バックグラウンドのアプリを減らす。16GBのメモリでは特に効きます。

根拠：[S01]

## PCが重いのか、通信が重いのか

| 症状 | 原因の目安 |
| --- | --- |
| 画面全体がガクガクする、カメラ操作が重い、GPU使用率が高い | FPSの低下。画質設定を見直す |
| 自分のカメラは滑らか、他のプレイヤーだけ瞬間移動する、スキルが遅れて出る | 通信・サーバーの遅延。画質を下げても改善しにくい |

開始直後など、人が集中する時間帯は、サーバーや回線の影響も考えてください。回線を改善するなら、有線LANにする、通信を使う他のアプリや機器を止める、ルーターを再起動する、近いサーバーを選ぶ、といった方法があります。

根拠：[S01] [S03]

## そのほか

- Steam版とPURPLE版のどちらかが明確に速いという公式情報はありません。重いからといって、ランチャーを変える前に上の項目を試してください。
- Steam Deckは、低〜Normal付近とFSRを基準にします。→ [[controller-and-steam-deck]]
- 自分のPCのスペックは、Windowsの設定の「バージョン情報」やdxdiagで確認できます。

根拠：[S01] [S02]
