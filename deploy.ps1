# Запуск: .\deploy.ps1

$ErrorActionPreference = "Stop"

# Конфиг
$SshHost = "80.87.102.60"
$SshUser = "root"
$ArchiveName = "deploy.tar.gz"

Write-Host "STARTING DEPLOY..." -ForegroundColor Green

# Билд и проверка типов
Write-Host "Building, generating types and migrations..." -ForegroundColor Cyan
pnpm install

# Генерируем типы Payload
npx payload generate:types

# Создание миграций схем для БД. Скрипт сам поймет, нужно ли создавать новый файл
./create-migration.ps1

# Билд Next.js
pnpm run build:prod 

# Проверка билда
if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Error "ERROR: .next\BUILD_ID not found"
    exit 1
}

# Упаковка архива
# src/migrations и src/payload.config.ts нужны для миграций на ВМ, а package.json и прочие файлы - для зависимостей
Write-Host "Archiving (tar)..." -ForegroundColor Cyan
tar -czf $ArchiveName .next public src package.json pnpm-lock.yaml next.config.ts components.json tsconfig.json

# Отправка архива на ВМ
# Загружаем файл в /root/deploy.tar.gz
Write-Host "Uploading..." -ForegroundColor Cyan
scp $ArchiveName "$($SshUser)@$($SshHost):/$($SshUser)/$ArchiveName"

Write-Host "DONE!" -ForegroundColor Green

# На ВМ:
# 1. Полное пересоздание проекта и БД:
# bash /var/app/scripts/reset_db.sh
# bash /var/app/scripts/update.sh

# 2. Просто обновление проекта и миграция БД:
# bash /var/app/scripts/update.sh

# 3. Очистка логов и кэша:
# TODO: настроить cron
# bash /var/app/scripts/clean-logs-and-cache.sh

# Логи указаны в:
# /etc/nginx/sites-available/polki-minto.ru

# Nginx:
# /etc/nginx/nginx.conf

# Сертификаты:
# /etc/nginx/sites-enabled/polki-minto.ru
# /etc/nginx/sites-enabled/polki-minto.ru
