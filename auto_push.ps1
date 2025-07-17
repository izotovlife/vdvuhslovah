# Получаем текущую дату и время
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commentLine = "# updated $now"

Write-Host ">>> Start auto update at $now"

# Находим все .py-файлы, кроме служебных директорий
$files = Get-ChildItem -Recurse -Include *.py -File | Where-Object {
    $_.FullName -notmatch '\\(venv|.git|.idea|__pycache__|migrations)\\'
}

$updatedFiles = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $found = $false

    # Ищем и заменяем строку "# updated ..."
    $newContent = $content | ForEach-Object {
        if ($_ -match '^# updated ') {
            $found = $true
            return $commentLine
        }
        return $_
    }

    # Если не нашли — добавим в конец
    if (-not $found) {
        $newContent += $commentLine
    }

    # Перезаписываем файл
    Set-Content -Path $file.FullName -Value $newContent
    $updatedFiles += $file.FullName
}

# Проверяем, есть ли изменения
$gitStatus = git status --porcelain
if ($gitStatus) {
    git add .
    $commitMessage = "Auto commit with dummy update $now"
    git commit -m $commitMessage
    git push origin main

    # Добавляем запись в лог
    "$now - PUSHED: $commitMessage" >> "push_log.txt"
    Write-Host ">>> Changes committed and pushed to GitHub."
} else {
    "$now - SKIPPED: No changes found" >> "push_log.txt"
    Write-Host ">>> No changes found. Nothing to commit."
}

Write-Host ">>> Done."
