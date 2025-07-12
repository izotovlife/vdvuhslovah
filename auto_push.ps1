# auto_push.ps1

# Перейти в каталог скрипта
Set-Location -Path $PSScriptRoot

# Удалить .pyc и __pycache__
Get-ChildItem -Recurse -Include __pycache__,*.pyc | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

# Проверить изменения
$gitStatus = git status --porcelain
if (-not $gitStatus) {
  Write-Host "✅ Нет изменений для коммита. Завершено." -ForegroundColor Green
  exit
}

# Получить текущую дату и время
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Dummy update во все .py файлы (кроме миграций и venv)
$files = Get-ChildItem -Recurse -Include *.py | Where-Object {
  $_.FullName -notmatch "\\migrations\\" -and $_.FullName -notmatch "\\venv\\"
}

foreach ($file in $files) {
  Add-Content -Path $file.FullName -Value "`n# updated $now" -Encoding utf8
}

# Добавить в git
git add .

# Показать список изменённых файлов
Write-Host "📄 Изменённые файлы:" -ForegroundColor Cyan
git diff --cached --name-only | ForEach-Object { Write-Host "• $_" }

# Создать коммит
git commit -m "Auto commit with dummy update $now"

# Отправить изменения на GitHub без подтверждения
git push origin main

Write-Host "✅ Изменения успешно отправлены на GitHub ($now)" -ForegroundColor Green
