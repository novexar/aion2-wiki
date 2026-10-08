import type { ChatExport } from './chat-repository';

export function exportFileName(data: ChatExport): string {
  return `aion2wiki-chat-${new Date(data.exportedAt).toISOString().slice(0, 10)}.json`;
}

/** 会話履歴を JSON ファイルとしてダウンロードさせる */
export function downloadExport(data: ChatExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName(data);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
