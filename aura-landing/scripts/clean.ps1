# Run from repo root or aura-landing: .\scripts\clean.ps1
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot\..
if (Test-Path node_modules) {
  cmd /c "rmdir /s /q node_modules"
}
if (Test-Path .next) {
  cmd /c "rmdir /s /q .next"
}
if (Test-Path package-lock.json) {
  Remove-Item -Force package-lock.json
}
Write-Host "Clean finished. Run: npm install && npm run dev"
