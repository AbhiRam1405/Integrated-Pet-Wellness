@echo off
REM Set JAVA_HOME for Maven Wrapper
REM This script helps set JAVA_HOME temporarily for the current session

REM Try to find Java installation
for /f "tokens=*" %%i in ('where java 2^>nul') do set JAVA_EXE=%%i

if "%JAVA_EXE%"=="" (
    echo Error: Java not found in PATH
    exit /b 1
)

REM Extract JAVA_HOME from java.exe location
REM Typically: C:\Program Files\Java\jdk-22\bin\java.exe
for %%i in ("%JAVA_EXE%") do set JAVA_BIN=%%~dpi
for %%i in ("%JAVA_BIN:~0,-1%") do set JAVA_HOME=%%~dpi
set JAVA_HOME=%JAVA_HOME:~0,-1%

echo JAVA_HOME set to: %JAVA_HOME%
echo.
echo Running: mvnw.cmd %*
echo.

REM Run Maven Wrapper with arguments
call "%~dp0mvnw.cmd" %*
