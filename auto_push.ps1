# auto_push.ps1

# 1. Переход в папку, где находится скрипт
Set-Location -Path $PSScriptRoot

# 2. Подготовка логов
$logFile = Join-Path $PSScriptRoot "push_log.txt"
"" | Out-File $logFile  # Очистка лога
$logLines = @()
$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$logLines += "=== Автообновление начато: $now ==="

Write-Host "🔍 Поиск всех .py файлов для dummy update..."

# 3. Обновляем все .py файлы
$updatedFiles = @()
$pyFiles = Get-ChildItem -Recurse -Filter *.py | Where-Object {
    $_.FullName -notmatch "__pycache__" -and
    $_.FullName -notmatch "\\venv\\" -and
    $_.FullName -notmatch "\\env\\"
}

foreach ($file in $pyFiles) {
    $content = Get-Content $file.FullName
    if ($content -notcontains "# dummy update") {
        Add-Content -Path $file.FullName -Value "`n# dummy update"
        $logLines += "✅ Обновлён файл: $($file.FullName)"
    } else {
        $logLines += "⏭ Пропущен (уже содержит dummy update): $($file.FullName)"
    }
}

# 4. Добавляем изменения
git add .

# 5. Формируем сообщение коммита
$commitMessage = "Auto commit with dummy update $now"

# 6. Проверка: есть ли изменения
if (-not (git diff --cached --quiet)) {
    git commit -m $commitMessage
    $logLines += "📝 Commit: $commitMessage"

    git pull --rebase origin main
    git push origin main

    $logLines += "✅ Изменения отправлены на GitHub."
} else {
    $logLines += "⚠️ Нет изменений для коммита. Всё уже актуально."
}

$logLines += "=== Завершено: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="

# 7. Выводим лог в консоль и сохраняем в файл
$logLines | Tee-Object -FilePath $logFile
