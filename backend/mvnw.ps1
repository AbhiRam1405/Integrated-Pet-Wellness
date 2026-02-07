# Maven Wrapper PowerShell Script
# This script sets JAVA_HOME and runs Maven Wrapper

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$MavenArgs
)

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"

# Verify Java exists
$javaExe = Join-Path $env:JAVA_HOME "bin\java.exe"
if (-not (Test-Path $javaExe)) {
    Write-Error "Java not found at: $javaExe"
    exit 1
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
Write-Host ""

# Run Maven Wrapper
$mvnwCmd = Join-Path $PSScriptRoot "mvnw.cmd"
& $mvnwCmd @MavenArgs

exit $LASTEXITCODE
