# Phase 2 監査レポート（Issue #13）

調査日: 2026-10-08。対象: basics / leveling / systems / dungeons / pvp / economy / classes / news / faq。
`tips` と `guide` は他エージェントが執筆中のため対象外（pending）。

## 1. カバレッジ（台帳 vs content/）

| カテゴリ | 台帳行数 | 存在 | 欠落 |
| --- | --- | --- | --- |
| basics | 35 | 35 | 0 |
| leveling | 23 | 23 | 0 |
| systems | 43 | 43 | 0 |
| dungeons | 34 | 34 | 0 |
| pvp | 13 | 13 | 0 |
| economy | 19 | 19 | 0 |
| classes | 14 | 14 | 0 |
| news | 17 | 17 | 0 |
| faq | 9 | 9 | 0 |
| tips | 21 | 21 | 0 |
| guide | 7 | 7 | 0 |

対象カテゴリの欠落行は 0。

## 2. ビルド検証（`npm run content`）

- エラー: 0 件。
- 警告（対象カテゴリ分）: 修正前 29 件 → 修正後 0 件。
- 残る警告は guide/tips 側のみ（`guide-daily-routine` 未作成。執筆中のため対象外）。

### 修正したリンク（旧 slug → 実在 slug）

| ファイル | 旧 | 新 |
| --- | --- | --- |
| basics/death-and-resurrection, systems/bracelets | ludra-raid | abyssal-forge-ludra |
| basics/party-and-matchmaking, stats-explained, systems/daevanion-boards, titles | il-and-combat-power | item-level-and-combat-power |
| basics/stats-explained | whats-different-on-global | global-vs-korea |
| leveling/navigator-and-journal, news/global-patch-notes | quest-tracker-teleport | travel-and-teleport |
| news/global-launch-timeline, systems/pets-and-mounts | growth-rewards-and-pass | attendance-and-growth-rewards |
| news/global-patch-notes | founders-pack | founders-packs |
| news/known-issues | market | market-and-exchange |
| news/ludra-raid-suspension | sanctuary-raids / special-slots-belt-amulet | sanctuary-raids-overview / belt-and-amulet |
| systems/belt-and-amulet, pantheon-stats, titles | monoliths-and-traces | monoliths-and-empyrean-traces |
| systems/bracelets, stigma | ascension | ascension-quests-and-gauge |
| systems/closet-and-skins | cash-shop | cash-shop-and-cosmetics |
| systems/daevanion-boards, stigma | abyss-shop | abyss-points-and-shop |
| systems/wings | expeditions-conquest | expeditions-and-odyle |
| pvp/artifact-siege | performance-tips | 変更なし（tips/performance-tips が新規作成されたため解消） |

related から削除したものは 0 件（すべて代替先が存在した）。

## 3. 信頼度・出典の衛生

- `confidence: community` は 42 記事。冒頭付近の `要確認` ブロックの欠落は 0 件（systems/collections-and-achievements は 45 行目にあり、frontmatter 後の最初の本文ブロックのため許容）。
- 出典 0 件の記事: 0。本文に `根拠：[S` が無い記事: 0。
- confidence の値が official / verified / community 以外の記事: 0。

## 4. 一貫性

| 項目 | 結果 | 対応 |
| --- | --- | --- |
| スキル名（party-roles-and-buffs vs classes/*） | 不一致あり | 暫定訳を classes の DB 名に統一: 激昂、巧みな反撃、波動撃、弱化の烙印、不敗のマントラ、保護の光、疾風の権能。暫定訳の注記を削除し、クラス記事へのリンクに置換 |
| アーリーアクセス開始時刻 | 22:00 と 23:00 が混在 | 実開始は 23:00 JST（予定 22:00 から 1 時間遅延。aion2-times FAQ と timeline 表が一致）。global-launch-timeline の summary と basics/game-overview の表を修正 |
| オード回復/上限（15/3h、560/840） | 一致 | なし |
| 遠征 IL 700/1400/2100、超越 IL 1600/1900/2200/2500 | 一致（不一致の数値なし） | なし |
| リセット（水曜 16:00 JST） | 一致 | なし |
| シューゴフェスタ鍵（3/日、上限 12/21）、悪夢（2/日、14）、使命 5/日 | 一致（正規表現での検出。逸脱なし） | なし |
| メンバーシップ 2,350 円 | 一致 | なし |

注記: news/global-launch-timeline の別行にある「正式開始 22:00」「メンテ 14:00〜22:00」は正式サービスの時刻であり、アーリーアクセスとは別。矛盾ではない。

## 5. 出典スポットチェック（各カテゴリ 2 記事、記事内の数値が最初の出典キャッシュに存在するか）

| 記事 | 出典 | 結果 |
| --- | --- | --- |
| basics/stats-explained | aion2maps global-differences | 部分一致（150 が出典に無い。要再確認） |
| basics/regions-and-servers | aion2maps launch-info | 数値抽出対象なし（pass 保留） |
| leveling/item-level-and-combat-power | aion2maps item-level | 部分一致（700 と 2,800 が無い。他出典にある可能性） |
| leveling/unlocks-by-level | aion2maps unlocks | pass（8/8） |
| systems/stigma | aion2maps skills-and-stigma | pass（6/6） |
| systems/enhancement | aion2maps enhancement | 部分一致（100 のみ欠落） |
| dungeons/shugo-festa | aion2.vi.ki | pass |
| dungeons/nightmare | aion2maps nightmare | pass（21/21） |
| pvp/abyss-overview | aion2maps abyss | pass |
| pvp/abyss-points-and-shop | aion2maps abyss | 部分一致（80,000 / 100,000 / 3,000 / 300 が無い。100,000 は aion2.run abysse と aion2maps potential に存在） |
| economy/membership | aion2maps membership-and-shop | pass |
| economy/market-and-exchange | NC 公式告知 | 数値抽出対象なし |
| classes/chanter, cleric | gaming.tools | pass（各 6/6） |
| news/global-launch-timeline, global-patch-notes | aion2maps / aion2hub | pass |
| faq/faq-dungeons | aion2-times FAQ | 部分一致（1,900 / 2,200 は他出典 aion2maps dungeons-and-raids にあり確認済み） |
| faq/faq-economy | aion2-times FAQ | 数値抽出対象なし |

自動照合は先頭の出典のみ。部分一致は他出典で補えているかの個別確認が未了のものを含む。

## 6. 残課題（再調査が必要）

| Issue | 内容 |
| --- | --- |
| #1 basics | stats-explained の「150」の出典確認 |
| #2 leveling | item-level-and-combat-power の 700 / 2,800 の出典確認 |
| #3 systems | enhancement の「100」の出典確認 |
| #5 pvp | abyss-points-and-shop の AP 価格（3,000 / 80,000 / 300）を DB で裏取り |
| tips / guide | pending。guide-daily-routine（未作成）への参照あり。完成後に再監査 |
| 全体 | community 記事 42 件は、2 件目の独立資料が得られ次第 verified へ昇格を検討 |

## 7. 追補（tips 追加監査）

- tips は 21/21 存在。ビルドは警告 0・エラー 0（guide 側の警告も解消）。
- tips の出典 0 件、`根拠：[S` 無し、community の `要確認` 欠落はいずれも 0 件。
- Launch Rewards 期限（12/1 vs 12/2）は矛盾ではない。12月1日 23:30 PT は日本時間の12月2日 16:30 にあたる。news/global-launch-timeline を「12月2日 16:30 JST（12月1日 23:30 PT）」に明記して統一した。
- guide は未監査（pending）。

## 8. 追補（guide 監査と数値の再確認）

- guide は 7/7 存在。ビルドは警告 0・エラー 0（全 235 記事）。7 本とも verified で、出典と `根拠：[S` の欠落は 0 件。
- 旧「残課題」の数値を出典で再確認した結果:

| 記事 | 数値 | 結果 |
| --- | --- | --- |
| systems/enhancement | +1〜+10 は 100% | 確認済み。aion2maps enhancement に「+10 まで必ず成功」とある（自動照合の誤検出） |
| leveling/item-level-and-combat-power | 700 / 2,800 | 誤検出。リンク先 slug 名の数字であり、本文の主張ではない |
| pvp/abyss-points-and-shop | 300 / 3,000 / 80,000 | 確認済み。aion2maps abyss と arenas-and-battlegrounds に記載（キャッシュ名の表記ゆれで先の照合から漏れた） |
| basics/stats-explained | 移動速度の上限 150% | どの出典キャッシュにも無い。断定を外し「上限値は出典で確認できず（要確認）」に修正 |

- 残課題は、community 記事 42 件の昇格検討のみ。
