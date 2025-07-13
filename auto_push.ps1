# auto_push.ps1

# auto_push.ps1

# Перейти в каталог скрипта
Set-Location -Path $PSScriptRoot

# Очистка .pyc и __pycache__ директорий (без ошибок, если файлов нет)
Get-ChildItem -Recurse -Include __pycache__, *.pyc -Force |
    Where-Object { $_.FullName -notmatch '\\venv\\' } |
    Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

# Проверка наличия изменений
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "✅ Нет изменений для коммита. Завершено." -ForegroundColor Green
    exit
}

# Получить текущую дату и время
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commentLine = "# updated $now"

# Найти .py файлы, исключая служебные директории
$files = Get-ChildItem -Recurse -Include *.py -File | Where-Object {
    $_.FullName -notmatch '\\(migrations|venv|.git|.idea|.vscode|__pycache__)\\'
}

# Добавить строку обновления, если её ещё нет
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch [regex]::Escape($commentLine)) {
        Add-Content -Path $file.FullName -Value "`n$commentLine"
    }
}

# Добавить все изменения в Git
git add .

# Показать список изменённых файлов
Write-Host "`n📄 Изменённые файлы:" -ForegroundColor Cyan
git diff --cached --name-only | ForEach-Object { Write-Host "• $_" }

# Определить текущую ветку
$branch = git rev-parse --abbrev-ref HEAD

# Коммит (если нет изменений, подавляем ошибку)
git commit -m "Auto commit with dummy update $now" 2>$null

# Push
git push origin $branch

Write-Host "`n✅ Изменения успешно отправлены на GitHub ($branch, $now)" -ForegroundColor Green
