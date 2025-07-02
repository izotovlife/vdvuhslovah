# auto_push.ps1
# Переход в папку, где лежит этот .ps1 файл
Set-Location -Path $PSScriptRoot

# Добавляем все изменения
git add .

# Коммит с текущей датой и временем
$commitMessage = "Auto commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Вытягиваем изменения и ребейзим
git pull --rebase origin main

# Пушим изменения
git push origin main

Write-Host "✅ Изменения успешно отправлены на GitHub!"
