@echo off
chcp 65001 > nul
echo ========================================
echo  NAGAMI 登録支援機関 システム 起動中...
echo ========================================
echo.

REM Node.jsの確認
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [エラー] Node.js がインストールされていません。
    echo https://nodejs.org からインストールしてください。
    pause
    exit /b 1
)

REM Gitの確認
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [エラー] Git がインストールされていません。
    echo https://git-scm.com からインストールしてください。
    pause
    exit /b 1
)

REM リポジトリがなければclone
if not exist "NAGAMI-YUKI" (
    echo リポジトリをダウンロード中...
    git clone https://github.com/nagami2003/NAGAMI-YUKI.git
    cd NAGAMI-YUKI
    git checkout claude/bold-volta-wnk8pv
) else (
    cd NAGAMI-YUKI
)

REM node_modulesがなければインストール
if not exist "node_modules" (
    echo 必要なファイルをインストール中（初回のみ時間がかかります）...
    npm install
)

REM DBがなければ初期化
if not exist "dev.db" (
    echo データベースを初期化中...
    npx prisma db push
    echo サンプルデータを投入中...
    npx tsx prisma/seed.ts
)

echo.
echo ========================================
echo  起動完了！ブラウザで開いてください:
echo  http://localhost:3000
echo ========================================
echo.

REM ブラウザを自動で開く
start http://localhost:3000

REM サーバー起動
npm run dev
