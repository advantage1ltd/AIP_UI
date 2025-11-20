# PowerShell script to restart dev server with MSW

Write-Host "🔧 Restarting Development Server with MSW..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev servers
Write-Host "1. Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*vite*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to AIP_UI directory
Set-Location -Path "AIP_UI" -ErrorAction Stop

# Start dev server
Write-Host ""
Write-Host "2. Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Look for these messages in the console:" -ForegroundColor Green
Write-Host "   - '🚀 Starting application with MSW...'" -ForegroundColor Gray
Write-Host "   - '✅ [MSW] Started successfully'" -ForegroundColor Gray
Write-Host "   - 'GET http://localhost:5128/api/incidents'" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Server will start at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📋 After logging in, check console for MSW interception logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev

