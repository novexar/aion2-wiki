---
id: controller-and-steam-deck
title: コントローラー対応
reading: こんとろーらーたいおう
category: basics
tags: [コントローラー, ゲームパッド, Steam Deck, Steam Input]
summary: 戦闘はコントローラーで遊べるが、NCは公式サポート対象外としている。Xbox系が最も無難で、メニューはマウス併用が現実的。Steam Deckも公式非対応だが動作報告がある。
confidence: verified
region: global
updated: 2026-10-08
aliases: [Controller, Gamepad, ゲームパッド, Steam Deck, Steam Input, DualSense, Xboxコントローラー]
related: [controls-and-keybinds, recommended-settings, platforms-and-requirements, steam-vs-purple]
sources:
  - id: S01
    title: Redfreshet：AION2 コントローラー・Steam Deck対応状況
    url: https://redfreshet.com/aion2-controller-steam-deck/
    date: 2026-10-06
    kind: guide
  - id: S02
    title: Aion 2 viki：Combat System
    url: https://aion2.vi.ki/combat-system
    date: 2026-10-07
    kind: guide
  - id: S03
    title: Aion 2 Maps：Chat commands and controls
    url: https://aion2maps.com/guides/commands-and-controls/
    date: 2026-09-28
    kind: guide
  - id: S04
    title: NC：Launch FAQ（Will there be controller support? / Linux or Steam Deck support?）
    url: https://lounge.plaync.com/feed/82939?country=US&locale=en-US
    date: 2026-10-08
    kind: official
---

> **要確認**：「コントローラーで遊べるが公式サポート対象外」「Steam Deck・Linux は公式サポート対象外」は NC の Launch FAQ で確認済みです。初期ボタン割り当ては Aion 2 Maps のクライアント解析1件のみ、機種ごとの動作（Xbox・DualSense・Steam Deck の快適さ）はユーザー報告に基づくため、更新やアンチチートの変更で動かなくなる可能性があります。

AION2 のグローバル版は、コントローラーを使って戦闘できますが、NC の Launch FAQ（2026-09-30、[S04]）では「遊べるが公式サポート対象ではない」とされています。Steam Deck も同じ扱いです。戦闘や移動はパッドで快適に動く一方、メニューやインベントリはマウスのカーソルを前提にした部分が残っています。

根拠：[S01] [S02] [S04]

## 対応状況

| 環境 | 状況 | おすすめ度 |
| --- | --- | --- |
| Xbox コントローラー（Windows） | 動作報告が多い | 高 |
| Xbox Elite 系（Windows） | 動作報告あり。背面ボタンは割り当てに便利 | 高 |
| PS5 DualSense（Windows） | 認識する環境としない環境がある | 中 |
| Steam Deck（SteamOS） | 動作報告あり。公式サポート外 | 中 |

コントローラー中心で遊ぶなら、Xbox 系を基本にします。手持ちの DualSense は、まず試して構いません。ただし、このゲームのために DualSense を新しく買うのは、対応が安定するまで待つほうが安全です。

根拠：[S01]

## 初期ボタン割り当て

ボタン名は、下・右・左・上の面ボタン、肩ボタン、トリガー、十字キーの位置で表します。割り当てはグローバル版クライアントの解析に基づきます。

| 動作 | ボタン |
| --- | --- |
| ジャンプ・滑空・無効化（Defiance） | 左の面ボタン |
| ダッシュ | 下の面ボタン |
| インタラクト | 右の面ボタン |
| 飛行の開始／停止 | 上の面ボタン |
| 騎乗／下りる | 左スティック押し込み |
| 基本攻撃／強攻撃 | 右の肩ボタン／右トリガー |
| スキルスロット3〜6 | 左の肩ボタン + 左・下・上・右の面ボタン |
| スキルスロット7〜8 | 左トリガー + 左／下の面ボタン |
| スキルスロット9〜12 | 左トリガー + 左・下・上・右の面ボタン |
| 消耗品1〜4／5〜8 | 十字キー／左の肩ボタン + 十字キー |
| カーソルを出す | 左の肩ボタン + 左トリガー |
| ターゲット変更 | 右スティック押し込み |
| マップ／キャンセル | 右の特殊ボタン／左の特殊ボタン |
| マクロ | 未設定 |

左トリガー + 面ボタンは初期状態で二重に使われています。スキルスロット9〜12が、スロット7〜8、パワーシャード、ポーション自動使用と同じ押し方を共有しています。キー設定で空いているボタンに移してください。キー設定は、すでに使われているボタンを警告します。

根拠：[S03]

## 認識しないときの手順

1. AION2 を終了する。
2. コントローラーを PC に接続して起動する。ゲーム起動後に接続すると認識しなかったが、先に接続すると使えた、という報告がある。
3. Steam 上でコントローラーが認識されていることを確認する。
4. まず Steam Input を無効にして AION2 を起動する。
5. 動かなければ、Steam Input を有効にして「ゲームパッド」系のレイアウトを適用し、AION2 を再起動する。
6. 別のコントローラーがあれば比較する。Xbox では動くのに DualSense では動かない場合は、パッドとの相性の可能性が高い。

設定を変更したら、ゲーム内で何度も接続し直すよりも、AION2 を一度終了してから確認したほうが原因を切り分けやすくなります。

根拠：[S01]

## おすすめの使い方

| 場面 | おすすめ |
| --- | --- |
| 移動・カメラ・戦闘・回避 | コントローラー |
| 設定、キャラクター作成、チャット、インベントリ整理 | マウスとキーボード |

テストでは、戦闘・移動・飛行はパッドで自然に動き、メニューとインベントリはマウスのカーソルが前提でした。テレビに PC をつないで遊ぶ場合も、ワイヤレスマウスやタッチパッドなど、カーソルを動かせる手段を1つ用意しておくと困りません。

Steam 版なら Steam Input やコミュニティのレイアウトを使えるため、調整手段が増えます。Steam 版と PURPLE 版の違いは [[steam-vs-purple]] を参照してください。

根拠：[S01] [S02]

## Steam Deck

公式にサポートされているのは、Steam または PURPLE を使う Windows PC です。Steam Deck は対象外ですが、SteamOS から起動してプレイしている報告があります。

| 項目 | 目安 |
| --- | --- |
| 画質 | 低〜Normal |
| アップスケーラー | FSR |
| 人が多い場所 | FPS が大きく落ちる。アビスや大規模戦は一段低い設定に |
| 操作 | 右トラックパッドをマウスにするレイアウトが便利。メニューのカーソルを補える |
| 背面ボタン | 組み合わせ操作やショートカットを割り当てる |

動作保証が必要な人、アップデートのたびの対応を避けたい人、大規模 PvP まで安定して遊びたい人は、Windows PC でのプレイが確実です。グラフィックの設定は [[recommended-settings]]、必要環境は [[platforms-and-requirements]] を参照してください。

根拠：[S01]
