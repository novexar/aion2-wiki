/**
 * 手動の同義語辞書。記事の別名（aliases）から自動生成できない言い換えを置く。
 * keys のどれかが質問に含まれたら、terms を検索語に加える。
 */
export interface ManualSynonym {
  readonly keys: readonly string[];
  readonly terms: readonly string[];
}

export const MANUAL_SYNONYMS: readonly ManualSynonym[] = [
  { keys: ['od'], terms: ['オードエネルギー'] },
  { keys: ['お金', '資金', '稼ぐ', '稼ぎ', '儲け', '儲かる', '収入'], terms: ['金策', 'ギーナ'] },
  { keys: ['課金', '会員', '月額', 'サブスク'], terms: ['メンバーシップ'] },
  { keys: ['装着', '付ける', 'つける', '付けられる', '装備できる'], terms: ['装備', '枠'] },
  { keys: ['速い', '早い', '早く', '速く', '短縮'], terms: ['時短'] },
  { keys: ['売る', '売却', '出品', '買う', '購入'], terms: ['取引所'] },
  { keys: ['節約', '安く', '無駄遣い'], terms: ['ギーナ', '節約'] },
  { keys: ['職業', 'ジョブ'], terms: ['クラス'] },
  { keys: ['回復役', 'ヒーラー', '回復職'], terms: ['回復', 'ヒーリング'] },
  {
    keys: ['初日', 'はじめ', '始めたて', '始めたばかり', 'ログイン直後'],
    terms: ['初日', 'チェックリスト'],
  },
  { keys: ['リセット', '更新時間', '何時に更新'], terms: ['リセット時刻'] },
  { keys: ['失敗', '消える', '消失', '壊れる'], terms: ['強化'] },
];
