# Start AgentDungeon on Windows: backend (port 8765) and frontend (port 3000)
# in two PowerShell windows, then open the browser already signed in.
# Double-click start-agentdungeon.cmd in the repo root to run this.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$cfg = Join-Path $env:USERPROFILE ".claude\claude-office-config.env"

if (-not (Test-Path $cfg)) {
    Write-Host "Hooks config not found: $cfg. Run hooks/install.sh first (see docs/guides/windows-dev-setup.md)." -ForegroundColor Red
    exit 1
}

# Reuse the hooks' API key so backend, hooks and browser all agree.
$key = (Get-Content $cfg | Where-Object { $_ -match '^CLAUDE_OFFICE_API_KEY=' } | Select-Object -First 1) `
    -replace '^CLAUDE_OFFICE_API_KEY=', '' -replace '["'']', ''
if (-not $key) {
    Write-Host "CLAUDE_OFFICE_API_KEY missing in $cfg." -ForegroundColor Red
    exit 1
}

# Backend: UTF-8 mode (Vietnamese text), no --reload (it hangs on Windows).
$backend = "`$env:PYTHONUTF8='1'; `$env:PYTHONIOENCODING='utf-8'; `$env:CLAUDE_OFFICE_API_KEY='$key'; " +
    "Set-Location '$root\backend'; uv run uvicorn app.main:app --host 127.0.0.1 --port 8765"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backend

$frontend = "Set-Location '$root\frontend'; npm run dev"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontend

Write-Host "Waiting for AgentDungeon to start..."
for ($i = 0; $i -lt 120; $i++) {
    try {
        Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 | Out-Null
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
Start-Process "http://localhost:3000/?token=$key"
Write-Host "AgentDungeon is running. Close the two PowerShell windows to stop it."
