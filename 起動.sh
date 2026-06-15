#!/bin/bash
echo "========================================"
echo " NAGAMI 登録支援機関 システム 起動中..."
echo "========================================"
echo ""

# Node.jsの確認
if ! command -v node &> /dev/null; then
    echo "[エラー] Node.js がインストールされていません。"
    echo "https://nodejs.org からインストールしてください。"
    exit 1
fi

# Gitの確認
if ! command -v git &> /dev/null; then
    echo "[エラー] Git がインストールされていません。"
    echo "https://git-scm.com からインストールしてください。"
    exit 1
fi

# リポジトリがなければclone
if [ ! -d "NAGAMI-YUKI" ]; then
    echo "リポジトリをダウンロード中..."
    git clone https://github.com/nagami2003/NAGAMI-YUKI.git
    cd NAGAMI-YUKI
    git checkout claude/bold-volta-wnk8pv
else
    cd NAGAMI-YUKI
fi

# node_modulesがなければインストール
if [ ! -d "node_modules" ]; then
    echo "必要なファイルをインストール中（初回のみ時間がかかります）..."
    npm install
fi

# DBがなければ初期化
if [ ! -f "dev.db" ]; then
    echo "データベースを初期化中..."
    npx prisma db push
    echo "サンプルデータを投入中..."
    npx tsx prisma/seed.ts
fi

echo ""
echo "========================================"
echo " 起動完了！ブラウザで開いてください:"
echo " http://localhost:3000"
echo "========================================"
echo ""

# ブラウザを自動で開く（Mac/Linux対応）
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 &> /dev/null &
fi

# サーバー起動
npm run dev
