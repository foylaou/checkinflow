# clear-port.sh
#!/bin/bash
PORT=$1
PID=$(lsof -ti :$PORT)
if [ -z "$PID" ]; then
  echo "✅ Port $PORT is free."
else
  echo "🛑 Killing process $PID on port $PORT..."
  kill -9 $PID
fi