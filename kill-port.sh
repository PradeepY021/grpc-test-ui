#!/bin/bash
# Script to kill process on port 3001

PORT=3001
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT is free - no process found"
else
    echo "🔍 Found process $PID using port $PORT"
    echo "🛑 Killing process $PID..."
    kill -9 $PID
    sleep 1
    
    # Verify
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "⚠️  Process still running, trying force kill..."
        kill -9 $PID 2>/dev/null
    else
        echo "✅ Port $PORT is now free!"
    fi
fi

