@echo off
setlocal enabledelayedexpansion

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python and try again.
    pause
    exit /b 1
)

:: Start a simple local HTTP server with Python
echo Starting local web server for Schema Viewer...
echo Access the site at: http://localhost:8000
echo Press Ctrl+C in this window to stop the server.
echo.

:: Open the browser automatically
start "" "http://localhost:8000"

:: Run the Python built-in HTTP server
python -m http.server 8000

endlocal