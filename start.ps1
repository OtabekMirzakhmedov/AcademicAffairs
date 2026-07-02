# Start Academic Affairs - Backend and Frontend

Write-Host "Starting Academic Affairs..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Start backend
Write-Host "Starting backend on http://localhost:3000..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; npm run start:dev" -PassThru

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Academic Affairs is running!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Swagger:  http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop both servers..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop processes
Write-Host "Stopping servers..." -ForegroundColor Red
Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Green
