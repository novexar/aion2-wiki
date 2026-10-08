import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function setup() {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      title="削除しますか"
      confirmLabel="削除"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onCancel, onConfirm, user: userEvent.setup() };
}

describe('ConfirmDialog', () => {
  it('Esc で取り消す（確定は呼ばない）', async () => {
    const { onCancel, onConfirm, user } = setup();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
