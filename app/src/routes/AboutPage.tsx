import { ExternalLink } from 'lucide-react';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { WikiShell } from '../features/wiki/WikiShell';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { CONFIDENCE_INFO } from '../lib/confidence';
import { ISSUES_URL, REPO_URL } from '../lib/site';
import type { Confidence } from '../lib/types';

const CONFIDENCE_ORDER: readonly Confidence[] = ['official', 'verified', 'community'];

function ExtLink({
  href,
  children,
}: {
  readonly href: string;
  readonly children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-accent-strong underline underline-offset-4"
    >
      {children}
      <ExternalLink aria-hidden="true" className="size-3" />
    </a>
  );
}

export default function AboutPage() {
  useDocumentMeta(
    'このサイトについて',
    'AION2 非公式Wiki の運営方針・情報の信頼度・出典方針について。',
  );
  return (
    <WikiShell wide>
      <div className="max-w-3xl">
        <h1 className="text-[1.75rem] font-bold">このサイトについて</h1>
        <div className="prose-wiki mt-6">
          <p>
            AION2（グローバル版）の非公式ファンサイトです。NC（NCSOFT）とは関係ありません。ゲーム内の表示や公式告知と異なる場合はそちらが正しいものとします。
          </p>

          <h2 id="confidence">情報の信頼度</h2>
          <p>
            各記事の冒頭に、記事全体の信頼度を表示しています。記事内で最も根拠の弱い主要な記述に合わせています。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>表示</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                {CONFIDENCE_ORDER.map((c) => (
                  <tr key={c}>
                    <td>
                      <ConfidenceBadge confidence={c} size="sm" />
                    </td>
                    <td>{CONFIDENCE_INFO[c].description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>単一の発言・噂・推測・韓国版のみの未実装仕様は掲載しません。</p>

          <h2 id="sources-policy">出典の方針</h2>
          <ul>
            <li>
              各記事の末尾に出典（S01
              などの番号つき）を一覧し、本文の「根拠：[S01]」から参照できます。
            </li>
            <li>
              公式告知・公式ガイドブック、データベース、攻略サイト、コミュニティ報告の種類を明記します。
            </li>
            <li>韓国版・台湾版の仕様は、グローバル版と区別して記載します。</li>
          </ul>

          <h2 id="chat">チャットについて</h2>
          <p>
            質問に関係する記事を検索し、その抜粋だけを根拠に Gemini が回答します。API
            キーはブラウザにだけ保存されます。回答は誤ることがあります。
          </p>

          <h2 id="contribute">ソースコードと誤りの報告</h2>
          <p>
            サイトのソースコードと記事の Markdown は{' '}
            <ExtLink href={REPO_URL}>GitHub リポジトリ</ExtLink> で公開しています。
            誤りや古い情報を見つけたら <ExtLink href={ISSUES_URL}>Issue</ExtLink>{' '}
            で知らせてください。
          </p>
          <p className="text-sm text-fg-subtle">
            AION は NCSOFT Corporation
            の登録商標です。このサイトで使用しているゲーム名・用語の権利は各権利者に帰属します。
          </p>
        </div>
      </div>
    </WikiShell>
  );
}
