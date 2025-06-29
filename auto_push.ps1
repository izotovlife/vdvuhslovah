# Переход в папку проекта
Set-Location -Path "C:\Users\ASUS Vivobook\PycharmProjects\PythonProject"

# Добавляем все изменения
git add .

# Коммит с текущей датой и временем
$commitMessage = "Auto commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Вытягиваем изменения и ребейзим
git pull --rebase origin main

# Пушим изменения
git push origin main
