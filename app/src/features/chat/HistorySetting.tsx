import { useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { downloadExport } from './chat-export';
import { getChatRepository, notifyHistoryChanged } from './chat-history';

/** 設定ページの「会話履歴」: 書き出しとすべて削除 */
export function HistorySetting() {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');

  const exportAll = async (): Promise<void> => {
    try {
      const repo = await getChatRepository();
      downloadExport(await repo.exportAll());
      setStatus('');
    } catch (error: unknown) {
      console.error('会話履歴を書き出せませんでした', error);
      setStatus('書き出せませんでした');
    }
  };

  const deleteAll = async (): Promise<void> => {
    setConfirming(false);
    try {
      const repo = await getChatRepository();
      await repo.deleteAll();
      notifyHistoryChanged();
      setStatus('削除しました');
    } catch (error: unknown) {
      console.error('会話履歴を削除できませんでした', error);
      setStatus('削除できませんでした');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void exportAll()}>書き出し</Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          すべて削除
        </Button>
      </div>
      <p role="status" className="mt-2 text-[13px] text-fg-muted">
        {status}
      </p>
      <ConfirmDialog
        open={confirming}
        title="会話履歴をすべて削除しますか"
        confirmLabel="削除"
        onConfirm={() => void deleteAll()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
