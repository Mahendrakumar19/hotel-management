#!/bin/bash

# Wait for MySQL to be available
# Usage: ./wait-for-mysql.sh [host] [port] [user] [password]

HOST="${1:-mysql}"
PORT="${2:-3306}"
USER="${3:-root}"
PASSWORD="${4:-root}"
TIMEOUT="${5:-30}"

echo "⏳ Waiting for MySQL at $HOST:$PORT..."

start_time=$(date +%s)

while true; do
  current_time=$(date +%s)
  elapsed=$((current_time - start_time))
  
  if [ $elapsed -gt $TIMEOUT ]; then
    echo "✗ Timeout waiting for MySQL after ${TIMEOUT}s"
    exit 1
  fi
  
  # Try to connect to MySQL
  if mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" -e "SELECT 1" &>/dev/null; then
    echo "✓ MySQL is ready!"
    exit 0
  fi
  
  echo "⏳ MySQL not ready yet, retrying in 2s... (${elapsed}s elapsed)"
  sleep 2
done
