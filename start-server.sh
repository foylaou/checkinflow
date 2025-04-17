#!/bin/bash

# Use environment variables or .env file for sensitive information
# Consider using a tool like dotenv or passing via environment

# Simply start the server using yarn

#!/bin/bash
export $(cat .env.local | xargs)
APP_NAME="nextjs-app"
LOG_FILE="./logs/server.log"
PID_FILE="./.server.pid"

mkdir -p ./logs

echo "🟢 Starting $APP_NAME..."

# 背景執行 yarn start 並將 stdout 和 stderr 寫入 log
yarn start --port 3001 > "$LOG_FILE" 2>&1 &

# 儲存 PID
echo $! > "$PID_FILE"

echo "✅ $APP_NAME started with PID $(cat $PID_FILE)"
echo "📄 Logging to: $LOG_FILE"
