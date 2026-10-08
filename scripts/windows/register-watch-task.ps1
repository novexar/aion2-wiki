# 週 1 回（月曜 09:00）に更新検知を実行するタスクを登録する。
# 実行内容は npm run watch のみ（レポート作成と通知）。記事の更新は行わない。
# 使い方: powershell -ExecutionPolicy Bypass -File scripts\windows\register-watch-task.ps1 [-Time 09:00] [-DayOfWeek Monday]
param(
  [string]$TaskName = 'AION2-Wiki-Watch',
  [string]$Time = '09:00',
  [System.DayOfWeek]$DayOfWeek = [System.DayOfWeek]::Monday
)
$ErrorActionPreference = 'Stop'

$runner = (Resolve-Path (Join-Path $PSScriptRoot 'run-watch.ps1')).Path
$taskArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`""
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $taskArgs
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $DayOfWeek -At $Time
# StartWhenAvailable: 予定時刻に PC が起動していなければ、次に使えるときに実行する
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
# 通知を表示するため、ログオン中のユーザーとして実行する
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "登録しました: $TaskName（毎週 $DayOfWeek $Time）。解除は unregister-watch-task.ps1。"
