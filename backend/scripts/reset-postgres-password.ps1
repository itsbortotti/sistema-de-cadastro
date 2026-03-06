# Redefine a senha do usuario postgres para admin123
# Execute: botao direito neste arquivo -> "Executar com PowerShell" (ou abra PowerShell como Administrador e rode: .\reset-postgres-password.ps1)

$pgConf = "C:\Program Files\PostgreSQL\15\data\pg_hba.conf"
$psql = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$novaSenha = "admin123"

if (-not (Test-Path $pgConf)) {
    Write-Host "Arquivo nao encontrado: $pgConf" -ForegroundColor Red
    exit 1
}

Write-Host "1. Alterando pg_hba.conf para trust temporariamente..." -ForegroundColor Yellow
$content = Get-Content $pgConf -Raw
$content = $content -replace 'host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
$content = $content -replace 'host\s+all\s+all\s+::1/128\s+scram-sha-256', 'host    all             all             ::1/128                 trust'
Set-Content $pgConf -Value $content -NoNewline

Write-Host "2. Reiniciando PostgreSQL..." -ForegroundColor Yellow
Restart-Service postgresql-x64-15 -Force
Start-Sleep -Seconds 3

Write-Host "3. Definindo nova senha (admin123)..." -ForegroundColor Yellow
& $psql -U postgres -h localhost -c "ALTER USER postgres PASSWORD '$novaSenha';"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao alterar senha. Revertendo pg_hba.conf..." -ForegroundColor Red
    $content = Get-Content $pgConf -Raw
    $content = $content -replace '127\.0\.0\.1/32\s+trust', '127.0.0.1/32            scram-sha-256'
    $content = $content -replace '::1/128\s+trust', '::1/128                 scram-sha-256'
    Set-Content $pgConf -Value $content -NoNewline
    Restart-Service postgresql-x64-15 -Force
    exit 1
}

Write-Host "4. Restaurando pg_hba.conf (exigir senha de novo)..." -ForegroundColor Yellow
$content = Get-Content $pgConf -Raw
$content = $content -replace '127\.0\.0\.1/32\s+trust', '127.0.0.1/32            scram-sha-256'
$content = $content -replace '::1/128\s+trust', '::1/128                 scram-sha-256'
Set-Content $pgConf -Value $content -NoNewline

Write-Host "5. Reiniciando PostgreSQL..." -ForegroundColor Yellow
Restart-Service postgresql-x64-15 -Force

Write-Host ""
Write-Host "Senha do usuario 'postgres' redefinida para: admin123" -ForegroundColor Green
Write-Host "Atualize o .env: DATABASE_URL=`"postgresql://postgres:admin123@localhost:5432/gestao_portfolio?schema=public`"" -ForegroundColor Cyan
