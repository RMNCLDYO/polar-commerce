#!/usr/bin/env bash

# Usage: ./scripts/time-script.sh "script-name" command args...
# Example: ./scripts/time-script.sh "build" npm run build

SCRIPT_NAME="$1"
shift

echo "⏱️  [$SCRIPT_NAME] Starting at $(date '+%H:%M:%S')"
START_TIME=$(date +%s)

# Run the command and capture exit code
"$@"
EXIT_CODE=$?

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Format duration
if [ $DURATION -ge 60 ]; then
  MINUTES=$((DURATION / 60))
  SECONDS=$((DURATION % 60))
  DURATION_STR="${MINUTES}m ${SECONDS}s"
else
  DURATION_STR="${DURATION}s"
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ [$SCRIPT_NAME] Completed in $DURATION_STR"
else
  echo "❌ [$SCRIPT_NAME] Failed after $DURATION_STR (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
