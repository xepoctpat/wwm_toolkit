$workspaceRoot = Split-Path -Parent $PSScriptRoot
$activateScript = Join-Path $workspaceRoot "wwm_toolkit_env\Scripts\Activate.ps1"

if (-not (Test-Path $activateScript)) {
    Write-Error "Local environment activation script not found at $activateScript"
    exit 1
}

Set-Location $workspaceRoot
. $activateScript

Write-Host "WWM Toolkit local Python environment activated: $env:VIRTUAL_ENV" -ForegroundColor Green
