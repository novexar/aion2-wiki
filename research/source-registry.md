# 情報源レジストリ（2026-10-08）

Wiki 執筆で使う情報源の一覧。`kind` は content/SCHEMA.md の sources.kind に対応。
「Global鮮度」は、グローバル版（2026-10-05 開始、クライアント 2.0.5.0）の仕様をどれだけ反映しているかの評価。

## 公式（kind: official）

| サイト | URL | 言語 | 内容 | 信頼性メモ | Global鮮度 |
| --- | --- | --- | --- | --- | --- |
| NC AION2 Global 公式（en-us） | https://aion2.plaync.com/en-us/ | EN | お知らせ、アップデート、FAQ、About（クラス） | 一次資料。一覧ページはJS描画のためWebFetch/curl不可。個別記事URLは直接指定で取得可 | ◎ |
| NC AION2 公式（ja-jp） | https://aion2.plaync.com/ja-jp/ | JA | 日本語お知らせ、アップデート | 同上。`/ja-jp/guidebook` は 404（日本語ガイドブック無し） | ◎ |
| NC Japan 特設サイト | https://aion2.ncsoft.jp/ja/ | JA | コンテンツ紹介、公式X/Discord/LINE 導線 | 一次資料 | ◎ |
| PURPLE Lounge Launch FAQ | https://lounge.plaync.com/feed/82939?country=US&locale=en-US | EN | Twitch連携、課金方針、Steam/PURPLE、言語、地域 | 一次資料（2026-10-05 更新） | ◎ |
| NC 公式 Team Update（課金方針） | https://aion2.plaync.com/en-us/board/notice/view?articleId=6a4d7d47a729ca5877f5e1ef | EN | メンバーシップ、Quna、パス、取引 | 一次資料。本文はJS描画で要ブラウザ | ◎ |
| 公式告知の索引（aion2builds） | https://aion2builds.com/sources/ | EN | 公式告知24件のURL/日付 | 二次だがURLの発見用として有用 | ◎ |
| 韓国公式ガイドブック | https://aion2.plaync.com/ko-kr/guidebook/ | KO | 韓国版の仕様 | 一次資料だが**韓国版**。Global と数値が異なる | △（KR） |
| 韓国 確率公示 | https://probability.plaync.com/aion2 | KO | 強化・製作等の確率 | 一次資料。Global の強化確率は同一（aion2maps 解析） | ○ |
| Steam ストア／ニュース | https://store.steampowered.com/app/3393110/ | 多言語 | 告知、ファウンダーズパック | 年齢確認でスクレイプ不可。ブラウザで確認 | ◎ |
| PR TIMES（NC Japan） | https://prtimes.jp/main/html/rd/p/000003071.000001868.html | JA | 正式サービス開始プレス | 一次資料 | ◎ |

## データベース（kind: database）

| サイト | URL | 言語 | 内容 | 信頼性メモ | Global鮮度 |
| --- | --- | --- | --- | --- | --- |
| AION 2 Global Database (gaming.tools) | https://aion2.gaming.tools/ja | JA/EN | アイテム、スキル、クエスト、マップ、コンテンツ、クラス、ペット、称号、実績、採集、製作ガイド、各種プランナー | クライアント解析。**Global 2.0.5.0 / 2026-10-05** と明記。未使用データが含まれ得る。WebFetch は403、curl（UA指定）で取得可 | ◎ |
| aion2hub Database | https://aion2hub.com/database | EN | アイテム、セット、実績、悪夢、覚醒、モノリス、称号、外形、ドロップ率 | Global テストクライアント解析と明記。パッチノート翻訳も網羅 | ◎ |
| questlog.gg Aion 2 | https://questlog.gg/aion-2 | EN | スキル、装備、アルカナ、プランナー | Global テストクライアント（aion2maps 評） | ○ |
| aion2.app（旧 aion2t.com） | https://aion2.app | EN | スキル・アイテム・ダンジョン | クライアント日付付き。地域は要確認 | ○ |
| Interactive Map (tc-imba) | https://aion2.tc-imba.com | EN | ヒドゥンキューブ、モノリス、採集、ボス | コミュニティ製 | ○ |

## 攻略ガイド（kind: guide）

| サイト | URL | 言語 | 内容 | 信頼性メモ | Global鮮度 |
| --- | --- | --- | --- | --- | --- |
| Aion 2 Maps | https://aion2maps.com/guides/ | EN | 86本。Global差分、解放レベル、日課週課、遠征、強化、クラス等。各主張に根拠タグ（NC written / Datamine / Creator advice / Conflicting） | 最も厳密な出典管理。Global ローンチビルド解析を含む。WebFetch 403、curl 可 | ◎ |
| redfreshet | https://redfreshet.com/?s=aion2 | JA | 42本。初心者、サーバー、クラスビルド、ダンジョン、金策、ルーン、オード等 | 日本語で最も網羅。更新日 2026-10-05〜06。数値は DB と突合推奨 | ◎ |
| AION2 Times | https://aion2-times.com/ | JA | 78本。クラス、FAQ、用語集、未実装一覧、KR更新履歴 | 日本語。KR記事とGlobal記事が混在するため記事ごとに対象地域を確認 | ○ |
| aion2hub | https://aion2hub.com/ | EN | レベリング（種族別）、クラス、ニュース43、パッチノート58、ツール | 公式告知の転載・翻訳が速い。KR/Global をラベル分け | ◎ |
| AION 2 WikiRealm | https://aion2.wikirealm.com/ | EN | 全219インスタンス一覧、通貨17種、ダエバニオン、イベント予定、コード | Global クライアント解析をうたう。一部数値が aion2maps と食い違う（スティグマ上限等） | ○ |
| Aion 2 Builds | https://aion2builds.com/ | EN | 8クラス、公式告知索引、リフトタイマー | 編集方針ページあり | ○ |
| Aion 2 viki | https://aion2.vi.ki/ | EN | 75ページ。ダンジョン、経済、PvP、地域、アップデート | 百科事典形式。KR情報の混入あり（オード回復量、角岩窟の扱い） | △ |
| Aion 2 Guide (aion2.run) | https://aion2.run/en/ | EN(多言語) | システム59項目、百科事典、ルーティン、アビス | 網羅的だが出典表示が弱い | ○ |
| gamerch AION2 攻略Wiki | https://gamerch.com/aion2/ | JA | 44ページ。クラス、ビルド、序盤、金策、IL、アビスポイント、ペット | 日本語ユーザー編集Wiki。編集者少数、要裏取り | ○ |
| MeinMMO | https://mein-mmo.de/en/aion-2-all-guides-tips-and-lists-overview,1585955/ | EN/DE | 23本。初心者30tips、失敗11、金策、Tier、日課 | ドイツ大手。経験則多め | ○ |
| あせろぐ | https://asellog.com/?s=aion2 | JA | メンバーシップ、ファウンダーズパック、日程 | 公式告知リンク付きで丁寧 | ◎ |
| Overgear | https://overgear.com/guides/aion-2/ | EN | 2本のみ | 薄い | △ |
| Icy Veins | https://www.icy-veins.com/aion-2/ | EN | 不明（403） | 取得不可 | ? |

## 日本の大手攻略サイト（調査結果）

| サイト | 結果 |
| --- | --- |
| GameWith | AION2 の攻略Wikiは無し。ニュース記事のみ（https://gamewith.jp/gamedb/17211/） |
| Game8 / Altema | AION2 ページは検索で確認できず |
| gamerch | 上記の通り存在（JA Wiki） |

## コミュニティ（kind: community）— 単独では採用しない

| 種別 | 例 | 扱い |
| --- | --- | --- |
| YouTube クリエイター | Madsin, Grobs, J0EI TV, aLuckyRO, TheWhelps, Anders, selegames（JA） | aion2maps が引用する場合のみ、confidence=community で参照可 |
| Google Doc 理論値 | kanonxo PvE Guide, Royal Vanguard Elyos Guide | 同上 |
| Reddit / X / DCInside / Bahamut | — | 採用しない（SCHEMA の unverified） |
| 既存 docs/（ChatGPT 作成） | リポジトリ内 | 参考のみ。正としない |

## 取得手段メモ

- `aion2maps.com`、`aion2.gaming.tools`、`aion2.plaync.com` は WebFetch が 403/404 になるが、`curl -A "Mozilla/5.0 ..."` で取得可能。
- `aion2.plaync.com` の一覧ページ（notice/update/event/guidebook list）は JS 描画で本文が無い。個別 `view?articleId=` は取得できる。
- `store.steampowered.com` は年齢確認ページ。`birthtime` クッキー付与が必要。
