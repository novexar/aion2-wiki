# register-watch-task.ps1 で登録したタスクを解除する。
param([string]$TaskName = 'AION2-Wiki-Watch')
$ErrorActionPreference = 'Stop'

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host "解除しました: $TaskName"
} else {
  Write-Host "タスクが見つかりません: $TaskName"
}
