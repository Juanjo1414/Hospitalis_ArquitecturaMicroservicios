# ═══════════════════════════════════════════════════════════════
#  Hospitalis Microservicios — Start All Services
#  Ejecutar: .\start-all.ps1
#  Detener:  .\start-all.ps1 -Stop
#  Instalar: .\start-all.ps1 -Install
#  Build:    .\start-all.ps1 -Build
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$Stop,
    [switch]$Build,
    [switch]$Install
)

$ErrorActionPreference = "SilentlyContinue"
$ROOT = $PSScriptRoot
$SERVICES_DIR = Join-Path $ROOT "hospitalis-microservicios\services"
$FRONTEND_DIR = Join-Path $ROOT "Hospitalis_Frontend\hospitalis-frontend"

$services = @(
    @{ Name = "Auth";             Dir = "auth-service";             Port = 3001 },
    @{ Name = "Patients";         Dir = "patients-service";         Port = 3002 },
    @{ Name = "Appointments";     Dir = "appointments-service";     Port = 3003 },
    @{ Name = "Medical Records";  Dir = "medical-records-service";  Port = 3004 },
    @{ Name = "Pharmacy";         Dir = "pharmacy-service";         Port = 3005 },
    @{ Name = "Messaging";        Dir = "messaging-service";        Port = 3006 },
    @{ Name = "Admin";            Dir = "admin-service";            Port = 3007 },
    @{ Name = "API Gateway";      Dir = "api-gateway";              Port = 3000 }
)

function Write-Banner {
    Write-Host ""
    Write-Host "  =========================================" -ForegroundColor Cyan
    Write-Host "       HOSPITALIS - Microservicios          " -ForegroundColor Cyan
    Write-Host "  =========================================" -ForegroundColor Cyan
    Write-Host ""
}

# ── STOP ──────────────────────────────────────────────────────
if ($Stop) {
    Write-Banner
    Write-Host "  Deteniendo todos los servicios..." -ForegroundColor Yellow

    foreach ($svc in $services) {
        $p = $svc.Port
        $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
        $procId = $null
        if ($conn) { $procId = ($conn | Select-Object -First 1).OwningProcess }
        if ($procId) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "  [x] $($svc.Name) (:$p) detenido" -ForegroundColor Red
        } else {
            Write-Host "  [-] $($svc.Name) (:$p) no estaba corriendo" -ForegroundColor DarkGray
        }
    }

    $fconn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($fconn) {
        $fpid = ($fconn | Select-Object -First 1).OwningProcess
        Stop-Process -Id $fpid -Force -ErrorAction SilentlyContinue
        Write-Host "  [x] Frontend (:5173) detenido" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "  Todos los servicios detenidos." -ForegroundColor Green
    exit 0
}

# ── INSTALL ───────────────────────────────────────────────────
if ($Install) {
    Write-Banner
    Write-Host "  Instalando dependencias..." -ForegroundColor Yellow

    foreach ($svc in $services) {
        $dir = Join-Path $SERVICES_DIR $svc.Dir
        Write-Host "  [$($svc.Name)] npm install..." -NoNewline
        Push-Location $dir
        npm install --silent 2>&1 | Out-Null
        Pop-Location
        Write-Host " OK" -ForegroundColor Green
    }

    if (Test-Path $FRONTEND_DIR) {
        Write-Host "  [Frontend] npm install..." -NoNewline
        Push-Location $FRONTEND_DIR
        npm install --silent 2>&1 | Out-Null
        Pop-Location
        Write-Host " OK" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "  Dependencias instaladas." -ForegroundColor Green
}

# ── BUILD ─────────────────────────────────────────────────────
if ($Build) {
    Write-Banner
    Write-Host "  Compilando servicios..." -ForegroundColor Yellow

    foreach ($svc in $services) {
        $dir = Join-Path $SERVICES_DIR $svc.Dir
        Write-Host "  [$($svc.Name)] nest build..." -NoNewline
        Push-Location $dir
        npx nest build 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Host " OK" -ForegroundColor Green }
        else { Write-Host " FAILED" -ForegroundColor Red }
        Pop-Location
    }
}

# ── START ─────────────────────────────────────────────────────
Write-Banner
Write-Host "  Iniciando microservicios..." -ForegroundColor Yellow
Write-Host ""

foreach ($svc in $services) {
    $dir = Join-Path $SERVICES_DIR $svc.Dir
    $svcName = $svc.Name
    $svcPort = $svc.Port
    $title = "Hospitalis - $svcName [:$svcPort]"

    $cmd = "Set-Location '$dir'; " + '$host.UI.RawUI.WindowTitle = ' + "'$title'; " + "Write-Host '=== $svcName Service (port $svcPort) ===' -ForegroundColor Cyan; npm run dev"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Minimized

    Write-Host "  [OK] $svcName  ->  http://localhost:$svcPort" -ForegroundColor Green
}

# Start frontend
if (Test-Path $FRONTEND_DIR) {
    $fcmd = "Set-Location '$FRONTEND_DIR'; " + '$host.UI.RawUI.WindowTitle = ' + "'Hospitalis - Frontend [:5173]'; " + "Write-Host '=== Frontend (port 5173) ===' -ForegroundColor Cyan; npm run dev"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fcmd -WindowStyle Minimized

    Write-Host "  [OK] Frontend  ->  http://localhost:5173" -ForegroundColor Green
}

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Green
Write-Host "   Todos los servicios iniciados!           " -ForegroundColor Green
Write-Host "                                            " -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:5173          " -ForegroundColor Green
Write-Host "   Gateway:   http://localhost:3000          " -ForegroundColor Green
Write-Host "                                            " -ForegroundColor Green
Write-Host "   Detener:   .\start-all.ps1 -Stop         " -ForegroundColor Yellow
Write-Host "  =========================================" -ForegroundColor Green
Write-Host ""
