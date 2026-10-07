# AION2 グローバル版 トピック台帳（Phase 0 / 2026-10-08）

目的：非公式Wiki `content/` に「1行＝1記事」で執筆するための網羅リスト。行ごとに参照元URL（実際に取得・確認したサイトの索引から採録）を付けた。
対象：グローバル版（2026-09-30 アーリーアクセス／2026-10-05 正式開始、Lv上限45、8クラス、クライアント 2.0.5.0）。韓国版限定は「KR限定」と明記。

優先度：P1＝初心者必須 ／ P2＝重要 ／ P3＝参考・資料。

## 集計

| カテゴリ | 行数 |
| --- | --- |
| basics | 35 |
| leveling | 23 |
| systems | 43 |
| dungeons | 34 |
| pvp | 13 |
| economy | 19 |
| classes | 14 |
| news | 17 |
| tips | 21 |
| faq | 9 |
| guide | 7 |
| **合計** | **235** |

## 列挙した情報源と、そこから採録した範囲

| 情報源 | 取得方法 | 列挙できた内容 |
| --- | --- | --- |
| NC 公式 Launch FAQ（lounge.plaync.com/feed/82939） | curl | Twitch連携、F2P＋任意会員制、課金方針リンク、Steam/PURPLE同一内容、KR/TW引継ぎ無し、言語一覧、地域 |
| NC 公式 Global 告知（aion2.plaync.com/en-us/board/notice/view?articleId=…） | 一覧ページはJS描画で取得不可。aion2builds.com/sources/ の公式告知索引（24件）と aion2maps の引用から URL を採録 | Launch FAQ、Team Update（課金）、Server Transfer、Launch Server List/Matchmaking、Update on Sanctuary Raid、Launch Rewards、Community Launch Events、Founder's Pack、Early Access、Launch Scale Test |
| NC Japan 公式（aion2.ncsoft.jp／aion2.plaync.com/ja-jp） | curl | 日本語公式サイトの導線（contents、お知らせ、Discord、LINE、ログイン）。ja-jp guidebook は 404（日本語ガイドブック無し。韓国語 ko-kr/guidebook のみ） |
| aion2.gaming.tools（Global DB、ver 2.0.5.0 / 2026-10-05） | curl（sitemap 19,747 URL） | カテゴリ：items(gear: weapons/armor/accessories/arcana, consumables, currencies, materials, growth-materials, special, miscellaneous, appearance)、skills(mastery/stigma)、quests(ascension/district/duty/exploration/gathercraftmastery/hero)、maps(dungeon/general/starter)、activities(イベント/探険/封印ダンジョン/駐屯地/遠征/アビス/悪夢/覚醒/闘技場/デイリー/レギオン/成長/聖域/覚醒戦/アビスアーティファクト)、classes(dealer/healer/tank)、pets(feral/intellect/nature/special/trans)、titles、collections、achievements、gatherables、npcs、status-effects、tools(build-planner, crafting-calculator, daevanion-planner, enchant-simulator, essence-extraction-planner, macros, map, progression)、guides/crafting(鍛冶/防具/細工/錬金/料理) |
| aion2maps.com | curl（sitemap 2,499 URL） | ガイド 86 本（全URL採録）、ダンジョン/ゾーン個別ページ 60、アイテム 2,302、採集 22 |
| redfreshet.com（日本語） | WebFetch 検索4ページ | 記事 42 本（全URL採録） |
| aion2-times.com（日本語） | curl（wp-sitemap） | 記事 78 本（全URL採録） |
| aion2hub.com | curl（sitemap 15,110 URL） | guides 7、leveling 11、classes 9、news 43、updates 58（Global 2 本＋KR）、tools 11、database 10 カテゴリ |
| aion2.wikirealm.com | WebFetch | classes/guides/dungeons/bosses/items/mechanics/events/pvp/codes の全ページ（約 20） |
| aion2builds.com | WebFetch | 8 クラス、systems、leveling、release、early-access、sources（公式告知索引） |
| aion2.vi.ki | WebFetch | 全 75 ページ（ダンジョン/経済/PvP/システム/地域/アップデート） |
| aion2.run（EN） | WebFetch | 59 のシステム項目、百科事典 79 アイテム |
| gamerch.com/aion2（日本語Wiki） | curl | 44 ページ（クラス、ビルド、序盤、金策、IL、アビスポイント、ペット等） |
| mein-mmo.de（EN/DE） | WebFetch | 23 ガイド |
| asellog.com（日本語） | WebFetch | 3 記事（メンバーシップ、ファウンダーズパック、日程） |
| Steam（app 3393110） | 年齢確認で本文取得不可。aion2maps/aion2hub の引用で代替 | — |
| icy-veins.com、overgear.com | 403／2本のみ | 不採用（代替で網羅） |
| game8 / gamewith / altema | AION2 の攻略Wikiは存在せず（gamewith はニュースのみ） | 不採用 |
| 既存 `docs/` | 参考のみ（正ではない） | 論点のヒントとして使用、URLは全て再取得 |

---

## basics（35）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 1 | game-overview | AION2とは（世界観・UE5・韓国/グローバルの経緯） | P1 | aion2-times https://aion2-times.com/what-is-aion2/ ／ aion2.vi.ki https://aion2.vi.ki/aion-2 ／ aion2.vi.ki https://aion2.vi.ki/global-release | |
| 2 | platforms-and-requirements | 対応プラットフォームと必要スペック（DLSS 4.5） | P1 | aion2hub https://aion2hub.com/guides/aion-2-system-requirements ／ aion2-times https://aion2-times.com/aion2-system-requirements/ ／ aion2-times https://aion2-times.com/aion2-global-dlss45/ ／ aion2.vi.ki https://aion2.vi.ki/system-requirements | コンソール・スマホ版は未発売（aion2-times.com/aion2-console-version-confirmed/） |
| 3 | steam-vs-purple | Steam版とPURPLE版の違い・連携 | P1 | redfreshet https://redfreshet.com/aion2-steam-purple-difference/ ／ NC Launch FAQ https://lounge.plaync.com/feed/82939 ／ aion2hub https://aion2hub.com/guides/aion-2-download | |
| 4 | nc-account-and-purple-setup | NCアカウント作成とPURPLE導入 | P1 | aion2-times https://aion2-times.com/aion2-nc-account-purple-setup/ ／ asellog https://asellog.com/aion2-launch/ | |
| 5 | regions-and-servers | リージョンとサーバー（Asia＝東京、天族/魔族ペア、43ペア） | P1 | aion2maps https://aion2maps.com/guides/launch-info/ ／ redfreshet https://redfreshet.com/aion2-server-recommendation/ ／ wikirealm https://aion2.wikirealm.com/guides/server-list/ ／ NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ac10581a279104f7d9d5f4c | |
| 6 | server-transfer | サーバー移動（10/14開始・同陣営のみ） | P2 | NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6abd2d50a279104f7d9d5ee2 ／ gamerch https://gamerch.com/aion2/1019901 ／ aion2-times https://aion2-times.com/aion2-kr-server-transfer/ | |
| 7 | races-elyos-asmodian | 天族と魔族の違い | P1 | redfreshet https://redfreshet.com/aion2-elyos-asmodian-differences/ ／ gamerch https://gamerch.com/aion2/1019893 ／ aion2-times https://aion2-times.com/aion2-races-factions/ ／ mein-mmo https://mein-mmo.de/aion-2-fraktionen-asmodier-oder-elyos/ | |
| 8 | story-and-lore | ストーリーと世界観（アトレイア、龍族、200年後） | P2 | aion2.vi.ki https://aion2.vi.ki/story-and-lore ／ aion2.vi.ki https://aion2.vi.ki/balaur ／ aion2-times https://aion2-times.com/aion2-changes-from-original-aion/ | |
| 9 | classes-overview | 8クラス一覧 | P1 | aion2-times https://aion2-times.com/aion2-class-overview/ ／ wikirealm https://aion2.wikirealm.com/classes/all-classes/ ／ gamerch https://gamerch.com/aion2/1018725 ／ NC https://aion2.plaync.com/en-us/about/index | |
| 10 | class-tier-and-recommendation | 初心者・ソロ・PvE・PvP別おすすめクラス | P1 | redfreshet https://redfreshet.com/aion2-best-class/ ／ wikirealm https://aion2.wikirealm.com/classes/class-tier-list/ ／ mein-mmo https://mein-mmo.de/aion-2-klassen-tier-list-pve/ ／ gamerch https://gamerch.com/aion2/982935 | Tier は意見。confidence=community |
| 11 | character-creation | キャラクター作成（枠4→8、名前、外見） | P1 | aion2.vi.ki https://aion2.vi.ki/character-creation ／ gamerch https://gamerch.com/aion2/1019716 ／ aion2maps https://aion2maps.com/guides/launch-info/ | |
| 12 | character-deletion-and-redo | キャラ削除（24時間）と作り直し | P2 | redfreshet https://redfreshet.com/aion2-character-customization-redo/ ／ aion2hub https://aion2hub.com/updates/aion-2-global-update-2026-10-05 | |
| 13 | controls-and-keybinds | 基本操作とキー設定 | P1 | aion2maps https://aion2maps.com/guides/commands-and-controls/ ／ redfreshet https://redfreshet.com/aion2-beginner-guide/ | |
| 14 | ui-and-menus | 画面・メニュー名（日英対照：遠征/超越/使命/物質変換/取引所…） | P1 | aion2maps https://aion2maps.com/guides/commands-and-controls/ ／ aion2-times https://aion2-times.com/aion2-glossary/ ／ aion2maps https://aion2maps.com/guides/unlocks/ | |
| 15 | recommended-settings | おすすめ設定（グラフィック/FPS/操作） | P1 | redfreshet https://redfreshet.com/aion2-best-graphics-settings-fps/ ／ aion2-times https://aion2-times.com/aion2-settings-guide/ ／ overgear https://overgear.com/guides/aion-2/best-game-settings/ | |
| 16 | controller-and-steam-deck | コントローラー・Steam Deck | P2 | redfreshet https://redfreshet.com/aion2-controller-steam-deck/ ／ aion2maps https://aion2maps.com/guides/launch-info/ | 公式は「非公式サポート」 |
| 17 | macros | ゲーム内マクロ | P2 | redfreshet https://redfreshet.com/aion2-macro-guide/ ／ gamerch https://gamerch.com/aion2/1019811 ／ aion2maps https://aion2maps.com/guides/auto-attack-cancel-and-macros/ ／ gaming.tools https://aion2.gaming.tools/macros | |
| 18 | combat-basics | 戦闘の基本（通常攻撃、キャンセル、無力化=スタッガー、予兆） | P1 | aion2maps https://aion2maps.com/guides/combat-basics/ ／ aion2maps https://aion2maps.com/guides/stagger/ ／ aion2.vi.ki https://aion2.vi.ki/combat-system | |
| 19 | stats-explained | ステータスの意味（命中/クリ/回避/強打/戦闘速度…） | P1 | aion2maps https://aion2maps.com/guides/stats-explained/ ／ aion2-times https://aion2-times.com/aion2-stats-basics/ ／ aion2maps https://aion2maps.com/guides/accuracy-and-crit/ ／ aion2.run https://aion2.run/en/stats | グローバルはクリ上限50%/回避30%（aion2maps global-differences） |
| 20 | how-damage-works | ダメージ計算と前方/後方ダメージ増幅 | P2 | aion2maps https://aion2maps.com/guides/how-damage-works/ ／ aion2-times https://aion2-times.com/aion2-kr-front-damage-amp/ ／ aion2maps https://aion2maps.com/guides/stat-lines/ | |
| 21 | status-effects-and-cc | 状態異常と無効化（Defiance） | P2 | aion2maps https://aion2maps.com/guides/pvp/ ／ gaming.tools https://aion2.gaming.tools/ja/status-effects | |
| 22 | flight-and-glide | 飛行とグライド | P1 | redfreshet（翼）https://redfreshet.com/aion2-beginner-guide/ ／ aion2-times https://aion2-times.com/aion2-flight-system/ ／ wikirealm https://aion2.wikirealm.com/guides/flying-guide/ ／ aion2.vi.ki https://aion2.vi.ki/flight-and-wings | |
| 23 | travel-and-teleport | 移動（キベリスク、風の道、帰還） | P1 | aion2.run https://aion2.run/en/carte ／ aion2-times https://aion2-times.com/aion2-glossary/ | |
| 24 | death-and-resurrection | 死亡と復活（復活の霊石） | P2 | aion2.run https://aion2.run/en/donjons ／ aion2hub https://aion2hub.com/updates/aion-2-update-2026-10-07 | |
| 25 | party-and-matchmaking | パーティとマッチング（サーバー横断、貢献度） | P1 | aion2maps https://aion2maps.com/guides/dungeons-and-raids/ ／ aion2.run https://aion2.run/en/groupe ／ NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ac0db8d6b722c561dc6a95b ／ aion2-times FAQ https://aion2-times.com/aion2-faq/ | |
| 26 | party-roles-and-buffs | 役割（タンク/ヒーラー/DPS）とパーティバフ | P2 | aion2maps https://aion2maps.com/guides/party-buffs/ ／ aion2maps https://aion2maps.com/guides/tanking/ ／ gaming.tools https://aion2.gaming.tools/ja/classes | |
| 27 | legion | レギオン（ギルド）：加入・作成・寄付・ショップ・飛行艇 | P1 | redfreshet https://redfreshet.com/aion2-legion-guide/ ／ aion2-times https://aion2-times.com/aion2-legion-guide/ ／ gamerch https://gamerch.com/aion2/1020146 ／ aion2maps https://aion2maps.com/guides/legions/ | |
| 28 | chat-and-social | チャット（陣営チャットLv30）・フレンド・ブロック | P2 | aion2maps https://aion2maps.com/guides/global-differences/ ／ aion2-times FAQ https://aion2-times.com/aion2-faq/ | |
| 29 | storage-and-cube | キューブ（所持品）・倉庫・サーバー倉庫・遠隔倉庫 | P1 | aion2maps https://aion2maps.com/guides/storage/ ／ aion2.run https://aion2.run/en/systemes | |
| 30 | whats-bound | 帰属（刻印）・キャラ/サーバー/アカウント単位の仕組み | P1 | aion2maps https://aion2maps.com/guides/whats-bound/ ／ aion2-times FAQ https://aion2-times.com/aion2-faq/ | |
| 31 | mail-and-coupon | メールとクーポン入力（TAKEFLIGHTAION2） | P1 | aion2maps https://aion2maps.com/guides/launch-rewards/ ／ redfreshet https://redfreshet.com/aion2-coupon-code/ ／ wikirealm https://aion2.wikirealm.com/codes/ ／ mein-mmo https://mein-mmo.de/aion2-codes/ | |
| 32 | glossary | 用語集（日英対照） | P1 | aion2-times https://aion2-times.com/aion2-glossary/ ／ aion2.run https://aion2.run/en/lexique ／ gaming.tools https://aion2.gaming.tools/ja | |
| 33 | languages-and-voice | 対応言語と音声 | P3 | NC Launch FAQ https://lounge.plaync.com/feed/82939 ／ aion2maps https://aion2maps.com/guides/launch-info/ | |
| 34 | rules-and-policies | 運営ポリシー・信頼ステータス・RMT警告 | P2 | aion2maps https://aion2maps.com/guides/rules-and-policies/ ／ aion2hub https://aion2hub.com/news/aion-2-illicit-currency-warning-kinah-quna | |
| 35 | useful-sites-and-tools | 便利サイト・ツール（DB、マップ、プランナー、タイマー） | P1 | aion2maps https://aion2maps.com/guides/useful-sites/ ／ gaming.tools https://aion2.gaming.tools/ja ／ aion2hub https://aion2hub.com/tools | |

## leveling（23）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 36 | leveling-1-to-45-overview | レベル上げ1〜45の全体像 | P1 | redfreshet https://redfreshet.com/aion2-leveling-1-45/ ／ gamerch https://gamerch.com/aion2/1019910 ／ mein-mmo https://mein-mmo.de/aion-2-schnell-leveln-guide-fuer-maximale-xp/ ／ wikirealm https://aion2.wikirealm.com/guides/leveling-guide/ | |
| 37 | elyos-leveling-route | 天族ルート（ポエタ→ベルテロン） | P1 | aion2hub https://aion2hub.com/leveling/elyos-levels-1-10 ／ https://aion2hub.com/leveling/elyos-levels-10-25 ／ https://aion2hub.com/leveling/elyos-levels-25-40 ／ https://aion2hub.com/leveling/elyos-levels-40-45-krao | |
| 38 | asmodian-leveling-route | 魔族ルート（イシャルゲン→アルトガルド） | P1 | aion2hub https://aion2hub.com/leveling/asmodian-levels-1-10 ／ https://aion2hub.com/leveling/asmodian-levels-10-25 ／ https://aion2hub.com/leveling/asmodian-levels-25-40 ／ https://aion2hub.com/leveling/asmodian-levels-40-45-krao | |
| 39 | main-story-episodes | メインストーリー（エピソード）と進行ロック | P1 | redfreshet https://redfreshet.com/aion2-beginner-guide/ ／ aion2.run https://aion2.run/en/quetes ／ gaming.tools https://aion2.gaming.tools/ja/quests/hero | |
| 40 | xp-tips-and-boosts | 経験値効率（討伐数、巻物、寄り道の是非） | P2 | redfreshet https://redfreshet.com/aion2-leveling-1-45/ ／ aion2maps https://aion2maps.com/guides/global-differences/ ／ gamerch https://gamerch.com/aion2/1019905 | |
| 41 | unlocks-by-level | レベル別の解放要素一覧 | P1 | aion2maps https://aion2maps.com/guides/unlocks/ | |
| 42 | ascension-quests-and-gauge | 覚醒クエストと覚醒ゲージ（「声を聞く者」） | P1 | redfreshet https://redfreshet.com/aion2-ascension-gauge-one-who-hears/ ／ gaming.tools https://aion2.gaming.tools/ja/quests/ascension ／ aion2.run https://aion2.run/en/progression | |
| 43 | what-to-do-at-45 | Lv45到達後にやること | P1 | aion2maps https://aion2maps.com/guides/what-to-do-at-45/ ／ redfreshet https://redfreshet.com/aion2-level45-daily-weekly-gear-progression/ ／ aion2-times https://aion2-times.com/aion2-item-level-1400-guide/ | |
| 44 | first-week-progression-plan | 最初の1週間の進め方 | P1 | wikirealm https://aion2.wikirealm.com/guides/first-week-progression/ ／ mein-mmo https://mein-mmo.de/aion-2-daily-weekly-checkliste-perfekter-start/ ／ aion2-times https://aion2-times.com/aion2-beginner-progression-guide/ | |
| 45 | regional-quests | 地域クエスト（報酬：ルーン箱・刻印ギーナ・知恵の石・結晶） | P1 | gaming.tools https://aion2.gaming.tools/ja/quests/district ／ aion2maps https://aion2maps.com/guides/what-to-do-at-45/ ／ aion2maps https://aion2maps.com/guides/unlocks/ | 天族22件/魔族23件（aion2maps） |
| 46 | sealed-dungeons | 封印ダンジョン（161）とその報酬 | P1 | gaming.tools https://aion2.gaming.tools/ja/activities/exploration ／ aion2.vi.ki https://aion2.vi.ki/sealed-dungeons-and-strongholds ／ wikirealm https://aion2.wikirealm.com/dungeons/dungeon-list/ | |
| 47 | strongholds | 駐屯地（ベルト巻物） | P1 | redfreshet https://redfreshet.com/aion2-stronghold-guide/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/exploration ／ aion2.vi.ki https://aion2.vi.ki/sealed-dungeons-and-strongholds | |
| 48 | monoliths-and-empyrean-traces | モノリスと神の痕跡 | P1 | redfreshet https://redfreshet.com/aion2-gods-trace-monolith/ ／ aion2-times https://aion2-times.com/aion2-god-trace-monolith/ ／ aion2hub https://aion2hub.com/database/monoliths | グローバルではスキルポイント報酬無し（aion2maps unlocks） |
| 49 | hidden-cubes | ヒドゥンキューブ（鍵・場所・報酬） | P1 | redfreshet https://redfreshet.com/aion2-hidden-cube/ ／ aion2maps https://aion2maps.com/guides/hidden-cubes/ ／ wikirealm https://aion2.wikirealm.com/mechanics/hidden-cubes/ ／ aion2hub https://aion2hub.com/maps/hidden-cubes | |
| 50 | supply-requests | 補給依頼（Lv25、アビスポイント） | P2 | aion2maps https://aion2maps.com/guides/unlocks/ ／ gaming.tools https://aion2.gaming.tools/ja/activities ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 51 | attendance-and-growth-rewards | 出席（チェックイン）と成長報酬 | P1 | aion2maps https://aion2maps.com/guides/launch-rewards/ ／ aion2maps https://aion2maps.com/guides/unlocks/ ／ gaming.tools https://aion2.gaming.tools/achievements/growth-support | 「新芽の証」はグローバル未使用 |
| 52 | launch-rewards-and-codes | ローンチ報酬・クーポン・Twitch Drops | P1 | aion2maps https://aion2maps.com/guides/launch-rewards/ ／ NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6abd4e20fa34c1011d6279e3 ／ redfreshet https://redfreshet.com/aion2-twitch-drops/ | |
| 53 | item-level-and-combat-power | 合計ILと戦闘力の読み方 | P1 | aion2maps https://aion2maps.com/guides/item-level/ ／ gamerch https://gamerch.com/aion2/1020151 ／ aion2.run https://aion2.run/en/stats | |
| 54 | progression-path-700-to-2800 | IL700→2800の進行ロードマップ | P1 | aion2maps https://aion2maps.com/guides/progression-path/ ／ redfreshet https://redfreshet.com/aion2-level45-daily-weekly-gear-progression/ ／ wikirealm https://aion2.wikirealm.com/items/gear-progression/ | |
| 55 | road-to-il-1000 | IL1000（アビス解放）への最短 | P1 | aion2maps https://aion2maps.com/guides/unlocks/ ／ redfreshet https://redfreshet.com/aion2-level45-daily-weekly-gear-progression/ | |
| 56 | road-to-il-1400 | IL1400への上げ方 | P1 | aion2-times https://aion2-times.com/aion2-item-level-1400-guide/ ／ aion2maps https://aion2maps.com/guides/progression-path/ | |
| 57 | story-locks-and-abyss-handin | ストーリーロックとアビス引き渡し（覚醒45） | P2 | aion2maps https://aion2maps.com/guides/unlocks/ ／ aion2maps https://aion2maps.com/guides/useful-sites/（Royal Vanguard guide） | |
| 58 | navigator-and-journal | ナビゲーターとジャーナル（使命タブの既知不具合） | P2 | aion2maps https://aion2maps.com/guides/unlocks/ ／ aion2hub https://aion2hub.com/updates/aion-2-global-update-2026-10-05 | |

## systems（43）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 59 | skills-and-specialties | スキルと特化（基礎Lv10＋追加Lv、ポイント203） | P1 | aion2maps https://aion2maps.com/guides/skills-and-stigma/ ／ aion2-times https://aion2-times.com/aion2-skill-specialization-basics/ ／ gamerch https://gamerch.com/aion2/1019929 ／ gaming.tools https://aion2.gaming.tools/ja/skills | |
| 60 | stigma | スティグマ（4枠 Lv22/27/32/37、上限20、欠片） | P1 | redfreshet https://redfreshet.com/aion2-stigma-guide/ ／ aion2-times https://aion2-times.com/aion2-level-stigma/ ／ wikirealm https://aion2.wikirealm.com/mechanics/daevanion-stigma/ ／ gaming.tools https://aion2.gaming.tools/ja/skills/stigma | wikirealm は上限25と記載→要照合（aion2maps は20） |
| 61 | skill-and-stigma-reset | スキル/スティグマのリセット（無料・返却） | P2 | aion2maps https://aion2maps.com/guides/skills-and-stigma/ ／ aion2maps https://aion2maps.com/guides/growth-overview/ | |
| 62 | daevanion-boards | ディーヴァニオンボード（5盤面、コスト134/168/232） | P1 | redfreshet https://redfreshet.com/aion2-daevanion-board-build/ ／ aion2maps https://aion2maps.com/guides/daevanion-boards/ ／ aion2-times https://aion2-times.com/aion2-devanion-node-guide/ ／ gamerch https://gamerch.com/aion2/1019904 | |
| 63 | daevanion-crystals | ディーヴァニオン結晶の入手先 | P1 | aion2maps https://aion2maps.com/guides/unlocks/ ／ aion2.run https://aion2.run/en/encyclopedie ／ gaming.tools https://aion2.gaming.tools/ja/items/growth-materials | |
| 64 | wisdom-stones | 知恵の石（スキルポイント） | P2 | aion2maps https://aion2maps.com/guides/unlocks/ ／ aion2.run https://aion2.run/en/encyclopedie | |
| 65 | pantheon-stats | パンテオン（神像ステータス、グローバルは半減） | P2 | aion2maps https://aion2maps.com/guides/pantheon-stats/ ／ aion2.run https://aion2.run/en/systemes | |
| 66 | titles | タイトル（称号） | P2 | gaming.tools https://aion2.gaming.tools/ja/titles ／ aion2hub https://aion2hub.com/database/titles ／ aion2maps https://aion2maps.com/guides/global-differences/ | |
| 67 | arcana | アルカナ（5種・2セット・等級・変換） | P1 | aion2maps https://aion2maps.com/guides/arcana/ ／ aion2-times https://aion2-times.com/aion2-arcana-basics/ ／ aion2.vi.ki https://aion2.vi.ki/arcana ／ gaming.tools https://aion2.gaming.tools/ja/items/gear/arcana | |
| 68 | equipment-slots-and-grades | 装備枠（20）と等級色・基礎IL（36〜102） | P1 | aion2maps https://aion2maps.com/guides/equipment-slots/ ／ aion2maps https://aion2maps.com/guides/gear-slots/ ／ aion2maps https://aion2maps.com/guides/global-differences/ | 英雄(赤)はシーズン1未実装 |
| 69 | enhancement | 強化（希少+5/伝承+10/唯一+15、確率、失敗時） | P1 | aion2maps https://aion2maps.com/guides/enhancement/ ／ aion2-times https://aion2-times.com/aion2-gear-enhancement/ ／ gamerch https://gamerch.com/aion2/1020138 ／ gaming.tools https://aion2.gaming.tools/enchant-simulator | |
| 70 | enhance-stones | 強化石の集め方と使い道 | P1 | gamerch https://gamerch.com/aion2/1020144 ／ wikirealm https://aion2.wikirealm.com/items/currencies/ | |
| 71 | amp-breakthrough | 突破（Amp）：段階と効果 | P2 | aion2maps https://aion2maps.com/guides/amp/ ／ aion2.run https://aion2.run/en/amelioration | |
| 72 | transfer-inheritance | 継承（唯一同士、継承石、必ず成功） | P1 | aion2maps https://aion2maps.com/guides/inheritance/ ／ aion2-times https://aion2-times.com/aion2-gear-enhancement/ ／ aion2.run https://aion2.run/en/amelioration | |
| 73 | extraction | 抽出（分解）で戻るもの | P2 | aion2.run https://aion2.run/en/amelioration ／ wikirealm https://aion2.wikirealm.com/items/gear-progression/ | |
| 74 | substance-morph | 物質変換（特殊装備の昇格・オードエネルギー製作） | P1 | aion2.run https://aion2.run/en/amelioration ／ gaming.tools https://aion2.gaming.tools/ja/items/special ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 75 | manastones-and-soulstones | 魔石・霊石（装着、入手先は終盤コンテンツ） | P2 | aion2maps https://aion2maps.com/guides/manastones/ ／ aion2.run https://aion2.run/en/amelioration | |
| 76 | theostones-godstones | 神石 | P3 | aion2.run https://aion2.run/en/amelioration ／ wikirealm https://aion2.wikirealm.com/items/gear-progression/ | |
| 77 | soul-binding | 魂刻印（Soul Binding/Imprint） | P2 | aion2maps https://aion2maps.com/guides/soul-binding/ ／ aion2.vi.ki https://aion2.vi.ki/enhancement-and-soul-imprint | |
| 78 | potential | 潜在力（PvPライン） | P3 | aion2maps https://aion2maps.com/guides/potential/ | |
| 79 | stat-lines-and-refining | オプションライン・精錬石（厳選） | P2 | aion2maps https://aion2maps.com/guides/stat-lines/ ／ aion2maps https://aion2maps.com/guides/upgrading-gear/ | |
| 80 | runes | ルーン（激突のルーン：入手・強化・消滅リスク） | P1 | redfreshet https://redfreshet.com/aion2-clash-rune/ ／ aion2maps https://aion2maps.com/guides/special-slots/ ／ gaming.tools https://aion2.gaming.tools/ja/items/gear/accessories | |
| 81 | bracelets | ブレスレット（覚醒/深淵） | P2 | aion2.run https://aion2.run/en/amelioration ／ aion2maps https://aion2maps.com/guides/special-slots/ | |
| 82 | belt-and-amulet | ベルト・アミュレット（専用巻物と昇格） | P1 | aion2maps https://aion2maps.com/guides/special-slots/ ／ aion2.run https://aion2.run/en/amelioration ／ gaming.tools https://aion2.gaming.tools/ja/items/gear/accessories | |
| 83 | wings | 翼（入手・強化無し・征服から封印ドロップ） | P1 | gamerch https://gamerch.com/aion2/1020171 ／ aion2maps https://aion2maps.com/guides/wings/ ／ gaming.tools https://aion2.gaming.tools/ja/appearances/wings | |
| 84 | pets-and-mounts | ペット・乗り物（無料2体、テイム、上限Lv3） | P1 | redfreshet https://redfreshet.com/aion2-pets-mounts/ ／ gamerch https://gamerch.com/aion2/1019933 ／ aion2-times https://aion2-times.com/aion2-pet-understanding-guide/ ／ aion2maps https://aion2maps.com/guides/pets/ | |
| 85 | pet-genus | ペット・ジーナス（解析/洞察） | P2 | aion2maps https://aion2maps.com/guides/pet-genus/ ／ aion2.run https://aion2.run/en/systemes | |
| 86 | closet-and-skins | クローゼット（外形）・染色・収集ステータス | P2 | aion2maps https://aion2maps.com/guides/closet/ ／ aion2.vi.ki https://aion2.vi.ki/cash-shop-and-cosmetics ／ gaming.tools https://aion2.gaming.tools/ja/appearances | |
| 87 | collections-and-achievements | 収集・実績 | P3 | gaming.tools https://aion2.gaming.tools/ja/collections ／ https://aion2.gaming.tools/ja/achievements ／ aion2hub https://aion2hub.com/database/achievements | |
| 88 | crafting-overview | 製作の基本（Lv10解放、熟練度100、昇級試験50） | P1 | redfreshet https://redfreshet.com/aion2-crafting-professions/ ／ gaming.tools https://aion2.gaming.tools/ja/guides/crafting ／ aion2maps https://aion2maps.com/guides/crafting/ | |
| 89 | crafting-blacksmithing | 鍛冶 | P3 | gaming.tools https://aion2.gaming.tools/guides/crafting/blacksmithing | |
| 90 | crafting-armorsmithing | 防具製作 | P3 | gaming.tools https://aion2.gaming.tools/guides/crafting/armorsmithing | |
| 91 | crafting-handicrafting | 細工 | P3 | gaming.tools https://aion2.gaming.tools/guides/crafting/handicrafting | |
| 92 | crafting-alchemy | 錬金 | P3 | gaming.tools https://aion2.gaming.tools/guides/crafting/alchemy | |
| 93 | crafting-cooking | 料理 | P3 | gaming.tools https://aion2.gaming.tools/guides/crafting/cooking | |
| 94 | gathering | 採集（Lv10解放、素材種、場所） | P1 | aion2maps https://aion2maps.com/gathering/ ／ gaming.tools https://aion2.gaming.tools/ja/gatherables ／ aion2.run https://aion2.run/en/artisanat | |
| 95 | essence-extraction | 精気抽出（オード・光るルビー、昇級） | P2 | redfreshet https://redfreshet.com/aion2-essence-extraction/ ／ gaming.tools https://aion2.gaming.tools/essence-extraction-planner | |
| 96 | crafted-gear | 製作装備（IL上限102） | P2 | aion2maps https://aion2maps.com/guides/global-differences/ ／ gaming.tools https://aion2.gaming.tools/crafting-calculator | |
| 97 | consumables-and-scrolls | 消耗品（戦闘強化巻物、ポーション、状態異常耐性） | P2 | gaming.tools https://aion2.gaming.tools/ja/items/consumables ／ aion2.run https://aion2.run/en/systemes | |
| 98 | presets | プリセット（装備/スキル/翼/称号） | P3 | aion2hub https://aion2hub.com/updates/aion-2-update-2026-10-07 | KRで3→5に拡張（Global要確認） |
| 99 | combat-analysis-dps-meter | 戦闘分析（ゲーム内DPSメーター） | P2 | aion2maps https://aion2maps.com/guides/dps-meters/ ／ aion2.run https://aion2.run/en/rotation ／ aion2-times https://aion2-times.com/aion2-kr-dps-stats-howto/ | |
| 100 | upgrading-gear-priority | 装備更新・強化の優先順位 | P1 | redfreshet https://redfreshet.com/aion2-gear-enhancement-progression/ ／ aion2maps https://aion2maps.com/guides/upgrading-gear/ ／ mein-mmo https://mein-mmo.de/aion-2-beste-ausruestung-guide/ | |
| 101 | gear-change-voucher | 装備変更券（武器選択箱） | P2 | gaming.tools https://aion2.gaming.tools/ja/items/special ／ aion2maps https://aion2maps.com/guides/progression-path/ | |

## dungeons（34）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 102 | dungeons-overview | ダンジョンの種類一覧（遠征/超越/聖域/悪夢/覚醒戦/デイリー/封印/駐屯地） | P1 | redfreshet https://redfreshet.com/aion2-dungeon-list/ ／ aion2maps https://aion2maps.com/guides/dungeons-and-raids/ ／ aion2-times https://aion2-times.com/aion2-dungeons/ ／ wikirealm https://aion2.wikirealm.com/dungeons/dungeon-list/ | |
| 103 | expeditions-and-odyle | 遠征（探険/征服）とキューブ・週制限 | P1 | aion2maps https://aion2maps.com/guides/expeditions-and-odyle/ ／ gamerch https://gamerch.com/aion2/1020170 ／ aion2.vi.ki https://aion2.vi.ki/expeditions ／ gaming.tools https://aion2.gaming.tools/ja/activities | |
| 104 | odyle-energy | オードエネルギー（回復15/3h、上限560/840、回復手段） | P1 | redfreshet https://redfreshet.com/aion2-odyle-energy/ ／ aion2-times https://aion2-times.com/aion2-od-energy-daily-routine/ ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 105 | expedition-reward-selection | 遠征の選択報酬（初回防具選択、受取回数） | P2 | aion2maps https://aion2maps.com/guides/progression-path/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/group-3 | |
| 106 | krao-cave | クラオ洞窟（★1：Lv20/IL200、征服IL700） | P1 | aion2maps https://aion2maps.com/guides/krao-cave/ ／ aion2maps https://aion2maps.com/krao-cave/ ／ gaming.tools https://aion2.gaming.tools/ja/activities ／ gaming.tools 実績 https://aion2.gaming.tools/achievements/dungeons/krao | |
| 107 | draupnir | ドラウプニル（★1） | P1 | aion2maps https://aion2maps.com/guides/draupnir/ ／ aion2maps https://aion2maps.com/draupnir/ ／ gaming.tools https://aion2.gaming.tools/achievements/dungeons/draupnir | |
| 108 | urugugu-canyon | ウルググ峡谷（★2：Lv28/IL300、征服IL1400） | P1 | aion2maps https://aion2maps.com/guides/urugugu-canyon/ ／ aion2maps https://aion2maps.com/urugugu-canyon/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/group-13 | |
| 109 | vakron-sky-island | バクロンの空中島（★2） | P1 | aion2maps https://aion2maps.com/guides/vakron-sky-island/ ／ aion2-times https://aion2-times.com/aion2-bakron-sky-island-guide/ ／ gaming.tools https://aion2.gaming.tools/achievements/dungeons/vakron | |
| 110 | fire-temple | 炎の神殿（★3：Lv35/IL500、征服IL2100） | P1 | aion2maps https://aion2maps.com/guides/fire-temple/ ／ aion2.vi.ki https://aion2.vi.ki/fire-temple ／ gaming.tools https://aion2.gaming.tools/achievements/dungeons/fire-temple | |
| 111 | ferocious-horn-den | 獰猛な角岩窟（★3） | P1 | aion2maps https://aion2maps.com/guides/ferocious-horn-den/ ／ aion2maps https://aion2maps.com/ferocious-horn-den/ ／ gaming.tools https://aion2.gaming.tools/achievements/dungeons/horn-den | aion2.vi.ki は「KR限定」と誤記の可能性→aion2maps/gaming.tools はGlobal収録。要照合 |
| 112 | transcendence-overview | 超越（段階IL1600/1900/2200/2500、2〜5人、ランク） | P1 | redfreshet https://redfreshet.com/aion2-transcendence-guide/ ／ aion2maps https://aion2maps.com/guides/transcendence/ ／ wikirealm https://aion2.wikirealm.com/dungeons/transcendence/ | |
| 113 | deus-research-base | デウス研究基地 | P1 | aion2maps https://aion2maps.com/deus-research-base/ ／ aion2maps https://aion2maps.com/guides/transcendence/ | |
| 114 | shattered-arkanis | 砕けたアルカニス | P1 | aion2maps https://aion2maps.com/shattered-arkanis/ ／ aion2maps https://aion2maps.com/guides/transcendence/ | |
| 115 | sanctuary-raids-overview | 聖域（10人レイド）の仕組み | P2 | aion2.vi.ki https://aion2.vi.ki/sanctuaries ／ aion2.run https://aion2.run/en/donjons ／ gaming.tools https://aion2.gaming.tools/ja/activities/raid | |
| 116 | abyssal-forge-ludra | 深淵の再錬：ルドラ（ローンチ時一時停止、IL2800） | P2 | NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ac39140d97eae18cc40e294 ／ aion2maps https://aion2maps.com/guides/ludra/ ／ aion2hub https://aion2hub.com/news/aion-2-sanctuary-raid-ludra-removed-at-launch ／ gaming.tools https://aion2.gaming.tools/ja/activities/group-10 | |
| 117 | nightmare | 悪夢（ジケルの幻影10段階、1日2回/上限14、幻影の欠片） | P1 | aion2maps https://aion2maps.com/guides/nightmare/ ／ aion2.vi.ki https://aion2.vi.ki/nightmare-and-ascension-trial ／ aion2hub https://aion2hub.com/database/nightmare | |
| 118 | boss-challenge | ボスチャレンジ（26ボス×10段階） | P2 | wikirealm https://aion2.wikirealm.com/bosses/boss-list/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/bosschallenge | |
| 119 | ascension-trial | 覚醒戦（難易度4、IL1000/1500/2000/2500、週3回） | P1 | aion2maps https://aion2maps.com/guides/dungeons-and-raids/ ／ aion2.vi.ki https://aion2.vi.ki/nightmare-and-ascension-trial ／ gaming.tools https://aion2.gaming.tools/ja/activities/ascension | |
| 120 | daily-dungeon | デイリーダンジョン（ディーヴァ生体研究基地、週14回/サーバー） | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/group-3001 ／ aion2.vi.ki https://aion2.vi.ki/daily-dungeons-and-shugo-festa | Globalは1種のみ（他2種はKR） |
| 121 | duty-quests | 使命（1日5件/サーバー、再抽選費用、報酬選び） | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ gaming.tools https://aion2.gaming.tools/ja/quests/duty ／ aion2.run https://aion2.run/en/routine | |
| 122 | commands-and-command-scrolls | 指令書（週12、アビス20、費用） | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ aion2.vi.ki https://aion2.vi.ki/endgame-routine | |
| 123 | shugo-festa | シューゴフェスタ（毎時、鍵3/日、上限12/21、百年人参の証） | P1 | aion2.vi.ki https://aion2.vi.ki/daily-dungeons-and-shugo-festa ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ wikirealm https://aion2.wikirealm.com/events/event-schedule/ | |
| 124 | dimensional-invasion | 次元侵攻（毎時30分、報酬鍵1/日） | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ wikirealm https://aion2.wikirealm.com/events/event-schedule/ ／ aion2.run https://aion2.run/en/routine | |
| 125 | field-bosses | フィールドボス（一覧・出現・報酬） | P1 | redfreshet https://redfreshet.com/aion2-field-boss-list/ ／ gamerch https://gamerch.com/aion2/1020204 ／ aion2hub https://aion2hub.com/tools/world-bosses ／ aion2.run https://aion2.run/en/donjons | |
| 126 | unknown-fissure | 不明な亀裂（チケット制コンテンツ） | P3 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ aion2maps https://aion2maps.com/guides/launch-rewards/ | 内容の一次資料が薄い。要追加調査 |
| 127 | daily-and-weekly-checklist | 日課・週課チェックリスト | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ gamerch https://gamerch.com/aion2/1019900 ／ redfreshet https://redfreshet.com/aion2-level45-daily-weekly-gear-progression/ | |
| 128 | reset-times | リセット時刻（日次07:00 UTC＝JST16:00、週次水曜） | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ wikirealm https://aion2.wikirealm.com/events/event-schedule/ ／ aion2.run https://aion2.run/en/horaires | |
| 129 | server-shared-limits-and-alts | サーバー共有の回数制限とサブキャラ | P1 | redfreshet https://redfreshet.com/aion2-alt-character/ ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ aion2.run https://aion2.run/en/routine | |
| 130 | seasons-and-chapters | シーズン1（9/30〜12/16）とランキング | P2 | aion2maps https://aion2maps.com/guides/seasons-and-chapters/ ／ aion2hub https://aion2hub.com/tools/seasons ／ aion2.vi.ki https://aion2.vi.ki/updates-and-seasons | |
| 131 | season-missions | シーズンミッションと誓いのコイン | P2 | aion2maps https://aion2maps.com/guides/seasons-and-chapters/ ／ aion2.run https://aion2.run/en/routine | |
| 132 | growth-dungeons | 成長ダンジョン（ファフナイト闘技場・静寂の墓地） | P3 | wikirealm https://aion2.wikirealm.com/dungeons/dungeon-list/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/growth | Global で開放中か要確認 |
| 133 | field-instances | フィールドインスタンス（放棄された龍族要塞 等） | P3 | wikirealm https://aion2.wikirealm.com/dungeons/dungeon-list/ | Global で開放中か要確認 |
| 134 | legion-airship-and-legion-content | レギオン飛行艇・レギオンコンテンツ | P3 | gaming.tools https://aion2.gaming.tools/ja/activities/guild ／ redfreshet https://redfreshet.com/aion2-legion-guide/ | |
| 135 | content-not-in-global | グローバル未実装コンテンツ一覧（KR限定） | P1 | aion2-times https://aion2-times.com/aion2-unreleased-contents/ ／ aion2maps https://aion2maps.com/guides/global-differences/ ／ wikirealm https://aion2.wikirealm.com/guides/global-vs-korea/ ／ aion2.vi.ki https://aion2.vi.ki/dungeons | 権聖(Brawler)、Lv50、エルテネン/モルヘイム、ハード/試練、緋色の欲望の鏡、ムスペルの聖杯、腐食した除染施設、悲しみの雪原、制圧、時空の亀裂争奪戦 等 |

## pvp（13）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 136 | pvp-overview | PvPの全体像（Lv45解放、PvPモード切替） | P1 | aion2maps https://aion2maps.com/guides/pvp/ ／ aion2.vi.ki https://aion2.vi.ki/pvp ／ aion2-times https://aion2-times.com/aion2-pvp-siege/ | |
| 137 | abyss-overview | アビス（下層レシャンタ、IL1000、週7時間） | P1 | redfreshet https://redfreshet.com/aion2-abyss-guide/ ／ aion2maps https://aion2maps.com/guides/abyss/ ／ wikirealm https://aion2.wikirealm.com/pvp/abyss-guide/ ／ aion2.vi.ki https://aion2.vi.ki/chaotic-abyss | |
| 138 | abyss-points-and-shop | アビスポイントの稼ぎ方とアビスショップ | P1 | gamerch https://gamerch.com/aion2/1020168 ／ aion2.run https://aion2.run/en/abysse ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 139 | artifact-siege | アーティファクト攻城戦（月/木/土 21:00） | P2 | aion2.vi.ki https://aion2.vi.ki/artifact-siege ／ wikirealm https://aion2.wikirealm.com/events/event-schedule/ ／ gaming.tools https://aion2.gaming.tools/ja/activities/abyssartifact | |
| 140 | abyss-field-bosses | アビスのフィールドボス（監視者カイラ 等） | P2 | wikirealm https://aion2.wikirealm.com/bosses/boss-list/ ／ aion2maps https://aion2maps.com/chaotic-lower-reshanta/ | |
| 141 | abyss-monolith | アビスのモノリス（エレシュキガル） | P3 | aion2.run https://aion2.run/en/abysse | 一次資料薄い |
| 142 | spacetime-rift | 時空の亀裂（3時間周期、Lv45、PvP設定） | P1 | redfreshet https://redfreshet.com/aion2-spacetime-rift/ ／ gamerch https://gamerch.com/aion2/1019908 ／ aion2.vi.ki https://aion2.vi.ki/spacetime-rift ／ aion2builds https://aion2builds.com/rift-timer/ | 「争奪戦(Domination)」はGlobal未実装 |
| 143 | arena-1v1-5v5 | 闘技場（ランク戦1v1/5v5、装備あり） | P2 | aion2maps https://aion2maps.com/guides/arenas-and-battlegrounds/ ／ aion2.vi.ki https://aion2.vi.ki/arena ／ gaming.tools https://aion2.gaming.tools/ja/activities/matching | |
| 144 | arena-of-tactics-10v10 | 戦術の闘技場（10v10、装備均一化、時間帯） | P2 | aion2maps https://aion2maps.com/guides/arenas-and-battlegrounds/ ／ aion2.vi.ki https://aion2.vi.ki/battlefield ／ wikirealm https://aion2.wikirealm.com/events/event-schedule/ | |
| 145 | duels-and-pvp-mode-rules | 決闘とPvPモードのルール（切替CD、強制PvP） | P2 | aion2maps https://aion2maps.com/guides/pvp/ ／ aion2.vi.ki https://aion2.vi.ki/pvp | |
| 146 | abyss-rank-and-season | アビスランク（軍階級）とシーズン報酬 | P2 | aion2maps https://aion2maps.com/guides/seasons-and-chapters/ ／ aion2hub https://aion2hub.com/tools/abyss-rankings | |
| 147 | pvp-stats-and-gear | PvP用ステータス・装備ライン・無効化の読み合い | P2 | aion2maps https://aion2maps.com/guides/pvp/ ／ aion2maps https://aion2maps.com/guides/potential/ | |
| 148 | silver-medal-of-merit | 銀の功績メダル | P3 | wikirealm https://aion2.wikirealm.com/items/currencies/ ／ aion2maps https://aion2maps.com/guides/pvp/ | |

## economy（19）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 149 | currencies-overview | 通貨一覧（17種） | P1 | wikirealm https://aion2.wikirealm.com/items/currencies/ ／ aion2.run https://aion2.run/en/encyclopedie ／ gaming.tools https://aion2.gaming.tools/ja/items/currencies | |
| 150 | kina-and-bound-kina | ギーナと刻印ギーナ（1日100万上限、優先消費） | P1 | aion2.vi.ki https://aion2.vi.ki/kina-and-quna ／ aion2-times https://aion2-times.com/aion2-exchange-money-basics/ ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 151 | quna | キューナ（価格、用途、キャラ枠1000） | P1 | aion2.vi.ki https://aion2.vi.ki/kina-and-quna ／ aion2maps https://aion2maps.com/guides/membership-and-shop/ | |
| 152 | market-and-exchange | 取引所（Lv45、非会員は出品のみ、会員は購入可） | P1 | asellog https://asellog.com/aion2-membership/ ／ aion2.vi.ki https://aion2.vi.ki/market-and-exchange ／ aion2-times https://aion2-times.com/aion2-exchange-money-basics/ ／ aion2maps https://aion2maps.com/guides/global-differences/ | |
| 153 | trading-rules | 取引ルール（直接取引禁止、サーバー倉庫、RMT） | P1 | NC Team Update https://aion2.plaync.com/en-us/board/notice/view?articleId=6a4d7d47a729ca5877f5e1ef ／ aion2hub https://aion2hub.com/news/aion-2-launch-scale-test-ends-trading-disabled-priority-queue ／ aion2maps https://aion2maps.com/guides/whats-bound/ | |
| 154 | membership | クァイリン特級メンバーシップ（$14.99/30日、サーバー単位、特典） | P1 | aion2maps https://aion2maps.com/guides/membership-and-shop/ ／ asellog https://asellog.com/aion2-membership/ ／ aion2-times https://aion2-times.com/aion2-membership/ ／ redfreshet https://redfreshet.com/aion2-monetization-membership/ | 日本円価格は要確認 |
| 155 | founders-packs | ファウンダーズパック（3種、特典のアカウント共通化） | P2 | asellog https://asellog.com/aion2-founders-pack/ ／ aion2.vi.ki https://aion2.vi.ki/founders-packs ／ NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ac1229d5657e135c2f5ef65 | |
| 156 | daeva-pass | ディーヴァパス（101段階、週5万EXP上限、1500キューナ） | P1 | wikirealm https://aion2.wikirealm.com/events/daeva-pass/ ／ aion2-times https://aion2-times.com/aion2-battle-pass-shop/ ／ aion2.vi.ki https://aion2.vi.ki/daeva-pass | |
| 157 | cash-shop-and-cosmetics | ショップ（外形、染色トークン、ステータス無し） | P2 | aion2.vi.ki https://aion2.vi.ki/cash-shop-and-cosmetics ／ aion2hub https://aion2hub.com/tools/shop ／ aion2maps https://aion2maps.com/guides/membership-and-shop/ | |
| 158 | kina-farming | 金策（征服キューブ20/30/40万、サブ、減額ライン） | P1 | redfreshet https://redfreshet.com/aion2-kina-farming/ ／ gamerch https://gamerch.com/aion2/1020166 ／ mein-mmo https://mein-mmo.de/aion-2-kinah-farmen-schnell-reich-werden/ ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 159 | odyle-energy-crafting-economics | オードエネルギー製作（物質変換5万ギーナ、週4/16枠）の損益 | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ gaming.tools https://aion2.gaming.tools/ja/items/special | |
| 160 | centuryroot-tokens-festa-shop | 百年人参の証とフェスタ商店 | P2 | wikirealm https://aion2.wikirealm.com/items/currencies/ ／ gaming.tools https://aion2.gaming.tools/ja/items/currencies | |
| 161 | phantasmal-fragments-nightmare-shop | 幻影の欠片と悪夢の交換所 | P2 | aion2maps https://aion2maps.com/guides/nightmare/ ／ wikirealm https://aion2.wikirealm.com/items/currencies/ | |
| 162 | oath-coins-season-shop | 誓いのコインとシーズンショップ（期限） | P2 | aion2maps https://aion2maps.com/guides/seasons-and-chapters/ ／ wikirealm https://aion2.wikirealm.com/items/currencies/ | |
| 163 | wind-breeze-merchants | 風の商人（会員専用） | P3 | aion2maps https://aion2maps.com/guides/global-differences/ ／ aion2maps https://aion2maps.com/guides/membership-and-shop/ | |
| 164 | payment-methods | 決済方法（Xsolla、Apple Pay、3Dセキュア、利用不可国） | P2 | aion2hub https://aion2hub.com/news/aion-2-apple-pay-cash-app-pay-payment-methods ／ aion2hub https://aion2hub.com/news/aion-2-payment-verification-3d-secure ／ aion2-times https://aion2-times.com/aion2-purple-payment-methods-change/ | |
| 165 | free-to-play-and-p2w | 無課金で遊べるか・P2W要素 | P1 | redfreshet https://redfreshet.com/aion2-monetization-membership/ ／ aion2hub https://aion2hub.com/guides/aion-2-free-to-play ／ mein-mmo https://mein-mmo.de/aion-2-bezahlmodell-abo-battle-pass-fruehzugang/ ／ aion2.vi.ki https://aion2.vi.ki/business-model | |
| 166 | abyss-points-for-pve | PvEプレイヤーのアビスポイント活用 | P2 | aion2-times FAQ https://aion2-times.com/aion2-faq/ ／ aion2.run https://aion2.run/en/abysse | |
| 167 | soul-crystals | 魂の結晶（ペット・ジーナス用） | P3 | wikirealm https://aion2.wikirealm.com/items/currencies/ ／ aion2hub https://aion2hub.com/updates/aion-2-update-2026-10-07 | |

## classes（14）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 168 | gladiator | グラディエーター | P1 | redfreshet https://redfreshet.com/aion2-gladiator-build/ ／ aion2maps https://aion2maps.com/guides/gladiator/ ／ aion2-times https://aion2-times.com/aion2-gladiator-build/ ／ gamerch https://gamerch.com/aion2/1018444 | |
| 169 | templar | テンプラー | P1 | redfreshet https://redfreshet.com/aion2-templar-build/ ／ aion2maps https://aion2maps.com/guides/templar/ ／ aion2-times https://aion2-times.com/aion2-templar-build/ ／ gamerch https://gamerch.com/aion2/1018615 | |
| 170 | assassin | アサシン | P1 | aion2maps https://aion2maps.com/guides/assassin/ ／ aion2-times https://aion2-times.com/aion2-assassin-build/ ／ gamerch https://gamerch.com/aion2/1018619 ／ aion2hub https://aion2hub.com/classes/assassin | redfreshet にアサシン記事無し |
| 171 | ranger | レンジャー | P1 | redfreshet https://redfreshet.com/aion2-ranger-build/ ／ aion2maps https://aion2maps.com/guides/ranger/ ／ aion2-times https://aion2-times.com/aion2-ranger-build/ ／ gamerch https://gamerch.com/aion2/1018620 | |
| 172 | sorcerer | ソーサラー | P1 | redfreshet https://redfreshet.com/aion2-sorcerer-build/ ／ aion2maps https://aion2maps.com/guides/sorcerer/ ／ aion2-times https://aion2-times.com/aion2-sorcerer-build/ ／ gamerch https://gamerch.com/aion2/1018621 | |
| 173 | spiritmaster | スピリットマスター | P1 | redfreshet https://redfreshet.com/aion2-spiritmaster-build/ ／ aion2maps https://aion2maps.com/guides/spiritmaster/ ／ aion2-times https://aion2-times.com/aion2-spiritmaster-build/ ／ gamerch https://gamerch.com/aion2/1018623 | |
| 174 | cleric | クレリック | P1 | redfreshet https://redfreshet.com/aion2-cleric-build/ ／ aion2maps https://aion2maps.com/guides/cleric/ ／ aion2-times https://aion2-times.com/aion2-cleric-build/ ／ gamerch https://gamerch.com/aion2/1018624 | KR 8/12 ヒール改修はGlobalに含まれるか要確認 |
| 175 | chanter | チャンター | P1 | redfreshet https://redfreshet.com/aion2-chanter-build/ ／ aion2maps https://aion2maps.com/guides/chanter/ ／ aion2-times https://aion2-times.com/aion2-chanter-build/ ／ gamerch https://gamerch.com/aion2/1018625 | |
| 176 | class-roles | クラスの役割分類（DPS/ヒーラー/タンク） | P2 | gaming.tools https://aion2.gaming.tools/ja/classes/dealer ／ https://aion2.gaming.tools/ja/classes/healer ／ https://aion2.gaming.tools/ja/classes/tank | |
| 177 | brawler-kwonseong | 権聖（Brawler）：KR限定の第9クラス | P3 | aion2-times https://aion2-times.com/aion2-kwonseong-new-class/ ／ aion2builds https://aion2builds.com/builds/brawler/ ／ aion2hub https://aion2hub.com/classes/brawler | KR限定 |
| 178 | tanking-guide | タンクの基本 | P2 | aion2maps https://aion2maps.com/guides/tanking/ | |
| 179 | healing-guide | ヒーラーの基本 | P2 | aion2maps https://aion2maps.com/guides/cleric/ ／ aion2maps https://aion2maps.com/guides/chanter/ | |
| 180 | rotation-and-skill-macros | ローテーションとスキルマクロ（クラス別） | P2 | aion2.run https://aion2.run/en/rotation ／ mein-mmo https://mein-mmo.de/aion-2-makro-mehr-schaden/ ／ aion2maps https://aion2maps.com/guides/auto-attack-cancel-and-macros/ | |
| 181 | class-balance-history | クラスバランス変更履歴（Globalに含まれるKRパッチ） | P3 | aion2hub https://aion2hub.com/updates/aion-2-update-2026-09-04 ／ aion2-times https://aion2-times.com/aion2-kr-july15-class-balance/ ／ aion2maps https://aion2maps.com/guides/global-differences/ | |

## news（17）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 182 | global-launch-timeline | グローバル版の日程（LST 9/17-18、EA 9/30、正式 10/5、シーズン1 12/16まで） | P1 | aion2maps https://aion2maps.com/guides/launch-info/ ／ asellog https://asellog.com/aion2-launch/ ／ aion2.vi.ki https://aion2.vi.ki/global-release ／ PR TIMES https://prtimes.jp/main/html/rd/p/000003071.000001868.html | |
| 183 | official-launch-faq | 公式 Launch FAQ の要約 | P1 | NC https://lounge.plaync.com/feed/82939 ／ NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ab83e52d97eae18cc40e12b | |
| 184 | known-issues | 既知の不具合（使命タブ、など） | P1 | aion2hub https://aion2hub.com/updates/aion-2-global-update-2026-10-05 ／ aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 185 | global-patch-notes | グローバル版パッチノート履歴（10/5〜） | P1 | aion2hub https://aion2hub.com/updates/aion-2-global-update-2026-10-05 ／ aion2hub https://aion2hub.com/updates ／ NC https://aion2.plaync.com/ja-jp/board/update/list | 一覧ページはJS描画。個別URLは随時追加 |
| 186 | ludra-raid-suspension | ルドラ一時停止の告知と今後 | P2 | NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6ac39140d97eae18cc40e294 ／ aion2hub https://aion2hub.com/news/aion-2-sanctuary-raid-ludra-removed-at-launch | |
| 187 | global-vs-korea | グローバル版と韓国版の違い（総覧） | P1 | aion2maps https://aion2maps.com/guides/global-differences/ ／ wikirealm https://aion2.wikirealm.com/guides/global-vs-korea/ ／ aion2hub https://aion2hub.com/news/aion-2-launch-scale-test-global-vs-korea-changes ／ aion2-times https://aion2-times.com/aion2-global-season1-no-heroic-gear/ | |
| 188 | korea-update-history | 韓国版アップデート履歴（2025/11〜2026/10、参考） | P3 | aion2hub https://aion2hub.com/updates ／ aion2-times https://aion2-times.com/aion2-kr-updates-2026-10/ ／ aion2.vi.ki https://aion2.vi.ki/updates-and-seasons | KR限定。将来のGlobal実装の参考 |
| 189 | roadmap-and-upcoming | 今後の予定（コンソール、新クラス、チャプター、未確定） | P3 | aion2-times https://aion2-times.com/aion2-unreleased-contents/ ／ aion2hub https://aion2hub.com/news/aion-2-console-version-dlss-5-gamescom-qa ／ playnews https://www.playnews.gg/en/news/aion-2-ncsoft-announces-five-upcoming-projects-for-the-abyss-in-advance-and-not-a-single-release-date | 未確定は confidence=community |
| 190 | twitch-drops-and-war-for-atreia | Twitch Drops と War for Atreia | P2 | aion2maps https://aion2maps.com/guides/launch-rewards/ ／ aion2hub https://aion2hub.com/news/aion-2-global-twitch-drops-september-30-october-16 ／ redfreshet https://redfreshet.com/aion2-twitch-drops/ | |
| 191 | community-launch-events | コミュニティイベント（超越リーダーボード等） | P2 | NC https://aion2.plaync.com/en-us/board/notice/view?articleId=6abd3200d97eae18cc40dfcb ／ aion2maps https://aion2maps.com/guides/launch-rewards/ | |
| 192 | jp-official-channels | 日本公式チャンネル（サイト、X、Discord、LINE、YouTube AION2ナビ） | P1 | NC Japan https://aion2.ncsoft.jp/ja/contents ／ aion2-times https://aion2-times.com/jp-official-site-open/ ／ aion2-times https://aion2-times.com/aion2-navi-03-summary/ | |
| 193 | collaborations-and-campaigns | コラボ・キャンペーン（森永エンゼルパイ等） | P3 | aion2-times https://aion2-times.com/aion2-morinaga-angelpie-collab/ ／ gamewith https://gamewith.jp/gamedb/17211/articles/62372 | |
| 194 | player-numbers-and-reception | 同時接続数・評価 | P3 | aion2.vi.ki https://aion2.vi.ki/reception-and-revenue ／ aion2hub https://aion2hub.com/news/aion-2-400k-players-customization-voucher-gifts | |
| 232 | season-1-end-notice | シーズン1終了日の公式告知（2026-12-16 16:00 JST、誓いのコイン/パスコイン失効） | P1 | NC（公式告知。URLはお知らせ一覧で確認） https://aion2.plaync.com/ja-jp/board/notice/list ／ aion2maps https://aion2maps.com/guides/seasons-and-chapters/ ／ wikirealm https://aion2.wikirealm.com/events/daeva-pass/ | 公式告知本文で日時を再確認 |
| 233 | membership-jp-price-notice | メンバーシップ日本円価格の公式告知（2,350円/30日） | P1 | NC Japan https://aion2.plaync.com/ja-jp/board/notice/view?articleId=6a850df1e6bf57144768a216 ／ asellog https://asellog.com/aion2-membership/ | 「8/19(水)新規商品のお知らせ（9/30 23:00修正）」。本文はブラウザで確認 |
| 234 | tradeable-kina-daily-cap-notice | 取引可能ギーナの1日上限（100万）とドロップ停止の公式仕様 | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ NC https://aion2.plaync.com/en-us/board/notice/list ／ aion2.vi.ki https://aion2.vi.ki/kina-and-quna | 公式告知URLを特定して追記 |
| 235 | weekly-cube-limit-notice | 週のサーバー共有キューブ受取制限（征服84/超越56回で減額、未受取10回）の公式仕様 | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ aion2maps https://aion2maps.com/guides/expeditions-and-odyle/ ／ aion2.vi.ki https://aion2.vi.ki/expeditions | 公式告知URLを特定して追記 |

## tips（21）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 195 | beginner-mistakes | 初心者がやりがちな失敗 | P1 | mein-mmo https://mein-mmo.de/aion-2-fehler-vermeiden-einsteiger-tipps/ ／ redfreshet https://redfreshet.com/aion2-beginner-guide/ ／ aion2-times https://aion2-times.com/aion2-early-game-tips/ | |
| 196 | irreversible-choices | 取り返しのつかない要素 | P1 | redfreshet https://redfreshet.com/aion2-beginner-guide/ | |
| 197 | day-one-checklist | 初日チェックリスト | P1 | aion2-times https://aion2-times.com/aion2-launch-preparation-checklist/ ／ mein-mmo https://mein-mmo.de/aion-2-einsteiger-guide-tipps/ | |
| 198 | inventory-tips | 所持品・倉庫整理のコツ | P2 | aion2maps https://aion2maps.com/guides/storage/ | |
| 199 | odyle-energy-tips | オードエネルギーを無駄にしない | P1 | redfreshet https://redfreshet.com/aion2-odyle-energy/ ／ aion2-times https://aion2-times.com/aion2-od-energy-daily-routine/ | |
| 200 | duty-reroll-tips | 使命の再抽選戦略 | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 201 | enhancement-tips | 強化は「次の入場条件まで」 | P1 | redfreshet https://redfreshet.com/aion2-gear-enhancement-progression/ ／ redfreshet https://redfreshet.com/aion2-level45-daily-weekly-gear-progression/ | |
| 202 | kina-saving-tips | ギーナを減らさない運用 | P2 | redfreshet https://redfreshet.com/aion2-kina-farming/ ／ mein-mmo https://mein-mmo.de/aion2-endgame-tipps/ | |
| 203 | party-etiquette-and-contribution | パーティマナーと貢献度 | P2 | aion2-times FAQ https://aion2-times.com/aion2-faq/ | |
| 204 | pet-selection-box | ペット選択箱のおすすめ | P2 | gamerch https://gamerch.com/aion2/1019829 ／ redfreshet https://redfreshet.com/aion2-pets-mounts/ | |
| 205 | quest-tracker-teleport | クエストトラッカーのテレポート活用 | P3 | aion2hub https://aion2hub.com/updates/aion-2-global-update-2026-10-05 | |
| 206 | twitch-linking-pitfalls | Twitch連携の落とし穴（再連携禁止） | P2 | aion2maps https://aion2maps.com/guides/launch-rewards/ ／ aion2hub https://aion2hub.com/news/aion-2-early-access-fixes-twitch-drops-account-linking | |
| 207 | scam-and-rmt-avoidance | ゴールドセラー・詐欺対策 | P2 | aion2hub https://aion2hub.com/news/aion-2-illicit-currency-warning-kinah-quna ／ aion2maps https://aion2maps.com/guides/rules-and-policies/ | |
| 208 | performance-tips | 軽量化・カクつき対策 | P2 | redfreshet https://redfreshet.com/aion2-best-graphics-settings-fps/ ／ aion2-times https://aion2-times.com/aion2-pc-build-guide/ | |
| 209 | auto-attack-cancel | 通常攻撃キャンセル | P2 | aion2maps https://aion2maps.com/guides/auto-attack-cancel-and-macros/ ／ mein-mmo https://mein-mmo.de/aion-2-makro-mehr-schaden/ | |
| 210 | field-boss-tagging | フィールドボスは一撃で報酬 | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 211 | ascension-trial-timing | 覚醒戦は週の最終日に | P2 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ | |
| 212 | server-choice-for-japanese | 日本人向けサーバー選び | P1 | redfreshet https://redfreshet.com/aion2-server-recommendation/ ／ gamerch https://gamerch.com/aion2/1019901 | |
| 213 | solo-play-tips | ソロで遊ぶコツ | P2 | NC Launch FAQ https://lounge.plaync.com/feed/82939 ／ mein-mmo https://mein-mmo.de/aion-2-grind-casual-freundlich-gelegenheitsspieler/ | |
| 214 | time-budget-routines | 30分・60分・2時間の遊び方 | P1 | aion2maps https://aion2maps.com/guides/daily-and-weekly/ ／ gamerch https://gamerch.com/aion2/1019900 | |
| 215 | endgame-tips | エンドゲームの14のコツ | P2 | mein-mmo https://mein-mmo.de/aion2-endgame-tipps/ ／ aion2.vi.ki https://aion2.vi.ki/endgame-routine | |

## faq（9）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 216 | faq-account-and-platform | アカウント・プラットフォーム（連携、言語、PS5/スマホ） | P1 | NC Launch FAQ https://lounge.plaync.com/feed/82939 ／ aion2-times https://aion2-times.com/aion2-faq/ ／ aion2hub https://aion2hub.com/guides/aion-2-download | |
| 217 | faq-characters | キャラクター（枠、削除、外見、クラス/陣営変更） | P1 | aion2-times https://aion2-times.com/aion2-faq/ ／ redfreshet https://redfreshet.com/aion2-character-customization-redo/ | |
| 218 | faq-economy | お金・アイテム（刻印、受け渡し、取引所） | P1 | aion2-times https://aion2-times.com/aion2-faq/ ／ aion2.vi.ki https://aion2.vi.ki/kina-and-quna | |
| 219 | faq-dungeons | ダンジョン（オード、探険/征服、貢献度、超越時期、バス） | P1 | aion2-times https://aion2-times.com/aion2-faq/ ／ aion2maps https://aion2maps.com/guides/dungeons-and-raids/ | |
| 220 | faq-gear | 装備（継承時期、ガーダー、外形消費、翼、失敗、ルーン） | P1 | aion2-times https://aion2-times.com/aion2-faq/ ／ aion2maps https://aion2maps.com/guides/enhancement/ | |
| 221 | faq-combat | 戦闘・ステータス（強打/完璧/クリ、前後方増幅） | P2 | aion2-times https://aion2-times.com/aion2-faq/ ／ aion2maps https://aion2maps.com/guides/how-damage-works/ | |
| 222 | faq-pvp-and-social | PvP・社交（アビスポイント、レギオン、チャット） | P2 | aion2-times https://aion2-times.com/aion2-faq/ | |
| 223 | faq-membership-and-pass | 課金（メンバーシップ、パス、何を買うべきか） | P1 | aion2-times https://aion2-times.com/aion2-faq/ ／ asellog https://asellog.com/aion2-membership/ | |
| 224 | faq-troubleshooting | トラブル（キュー、ログイン、Drops未着、EA消失） | P2 | mein-mmo https://mein-mmo.de/aion2-early-access-zugang-verloren/ ／ aion2hub https://aion2hub.com/news/aion-2-early-access-fixes-twitch-drops-account-linking ／ redfreshet https://redfreshet.com/aion2-twitch-drops/ | |

## guide（7）— 初心者ロードマップ（docs/ 書き直しと同期）

| # | slug | 日本語タイトル | P | 参照元 | 備考 |
| --- | --- | --- | --- | --- | --- |
| 225 | guide-day-1 | 初日：アカウント〜Lv10 | P1 | 行 3,4,5,7,9,11,13,15,31,36 | |
| 226 | guide-week-1 | 1週目：Lv45到達と解放要素の回収 | P1 | 行 41,42,43,44,45,46,47,48,49 | |
| 227 | guide-il-700-to-1400 | IL700→1400 | P1 | 行 54,55,56,103,106,107,121,123 | |
| 228 | guide-il-1400-to-2100 | IL1400→2100 | P1 | 行 54,108,109,112,113,114,117,119 | |
| 229 | guide-il-2100-to-2800 | IL2100→2800 | P1 | 行 54,110,111,112,116,137 | |
| 230 | guide-daily-routine | 日課・週課テンプレ | P1 | 行 127,128,129,214 | |
| 231 | guide-starter-builds | クラス別スタータービルド早見 | P2 | 行 168〜175 | |

---

## 残る不確実性・ギャップ（上位10）

1. **NC公式 ja-jp／en-us のお知らせ一覧がJS描画で列挙不可**。個別記事URLは aion2builds.com/sources/ と aion2maps の引用から 24 件採録したが、日本語版お知らせ（1日緊急メンテ、配信プレゼント等）の網羅は未達。執筆時はブラウザで一覧を直接確認する必要あり。
2. **獰猛な角岩窟（Ferocious Horn Den）のGlobal収録**：aion2.vi.ki は「KR/TW限定」、aion2maps・gaming.tools（2.0.5.0）は「Global 6遠征に含む」。後者が一次に近い（クライアント解析・DB）ため採用予定だが要照合。
3. **スティグマ上限**：aion2maps「20」、wikirealm「25」。Global クライアント解析は aion2maps。要再確認。
4. **オードエネルギー回復量**：aion2.vi.ki「通常10/会員15」、aion2maps・redfreshet「全員15、上限560/840」。後者（Global実機）を優先。
5. **デイリーダンジョン**：wikirealm は3種（クロバキ、生体研究基地、オディウム）、aion2maps/gaming.tools は Global は「ディーヴァ生体研究基地」1種のみ。要照合。
6. **メンバーシップの日本円価格**：USD 14.99 を確認。JP は 2,350円/30日（NC Japan 告知 articleId=6a850df1e6bf57144768a216、本文は未取得のため執筆時に照合）。
7. **デイリーリセット時刻**：07:00 UTC（JST 16:00）で aion2maps 実機確認。wikirealm は「16:00 鍵補充」。日本公式表記は未確認。
8. **成長ダンジョン／フィールドインスタンス／不明な亀裂／アビスのモノリス**：資料が薄く、Global で開放中か未確定。
9. **KRパッチの反映範囲**：Global は「KR 9/16 パッチまでのクラスキット」（aion2maps）。クレリック/チャンターの 8/12 ヒール改修が含まれるかは要確認。
10. **コミュニティ由来の数値**（Tier、ビルド、金策額）は confidence=community として扱い、DB（gaming.tools）と突き合わせる必要がある。
