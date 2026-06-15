@echo off
echo ========================================
echo  NAGAMI System - Setup and Start
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install from: https://nodejs.org
    pause
    exit /b 1
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed.
    echo Please install from: https://git-scm.com
    pause
    exit /b 1
)

if not exist "NAGAMI-YUKI" (
    echo Downloading files...
    git clone https://github.com/nagami2003/NAGAMI-YUKI.git
    cd NAGAMI-YUKI
    git checkout claude/bold-volta-wnk8pv
) else (
    cd NAGAMI-YUKI
)

if not exist "node_modules" (
    echo Installing packages (first time only, please wait)...
    npm install
)

if not exist "dev.db" (
    echo Setting up database...
    npx prisma db push
    echo Loading sample data...
    npx tsx prisma/seed.ts
)

echo.
echo ========================================
echo  Ready! Opening browser...
echo  URL: http://localhost:3000
echo ========================================
echo.

start http://localhost:3000
npm run dev
