# 週次タスクから呼ばれる。npm run watch を実行し、変化があれば通知する（記事の更新はしない）。
# 終了コード: 0 = 変化なし / 1 = 変化あり / 2 = スクリプト異常
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$appDir = Join-Path $repoRoot 'app'
$logDir = Join-Path $repoRoot 'research\watch'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir 'last-run.log'

function Show-Notification([string]$title, [string]$message) {
  try {
    [void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
    [void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml("<toast><visual><binding template='ToastGeneric'><text></text><text></text></binding></visual></toast>")
    $texts = $xml.GetElementsByTagName('text')
    [void]$texts.Item(0).AppendChild($xml.CreateTextNode($title))
    [void]$texts.Item(1).AppendChild($xml.CreateTextNode($message))
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('AION2 Wiki watch')
    $notifier.Show($toast)
  } catch {
    # トースト API が使えない環境では msg にフォールバックする
    & msg.exe $env:USERNAME "$title`n$message" 2>$null
  }
}

Push-Location $appDir
$ErrorActionPreference = 'Continue'
try {
  & npm.cmd run watch *> $logFile
  $code = $LASTEXITCODE
} finally {
  Pop-Location
}

switch ($code) {
  0 { }
  1 { Show-Notification 'AION2 Wiki: 更新あり' 'research/watch のレポートを確認し、Claude Code で /update-wiki を実行してください。' }
  default { Show-Notification 'AION2 Wiki: 検知に失敗' "終了コード $code。research/watch/last-run.log を確認してください。" }
}
exit $code
