#!/bin/sh

set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
JAVA_21_HOME=""

if [ -d /usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ]; then
  JAVA_21_HOME=/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
fi

if [ -z "$JAVA_21_HOME" ] && [ -d /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ]; then
  JAVA_21_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
fi

if [ -z "$JAVA_21_HOME" ] && [ -x /usr/libexec/java_home ]; then
  CANDIDATE=$(/usr/libexec/java_home -v 21 2>/dev/null || true)
  if [ -n "$CANDIDATE" ] && "$CANDIDATE/bin/java" -version 2>&1 | head -n 1 | grep -q 'version "21'; then
    JAVA_21_HOME=$CANDIDATE
  fi
fi

if [ -z "$JAVA_21_HOME" ]; then
  echo "Java 21을 찾지 못했습니다. 'brew install openjdk@21' 실행 후 다시 시도하세요." >&2
  exit 1
fi

export JAVA_HOME="$JAVA_21_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

cd "$PROJECT_DIR"

sync_android() {
  npm run build:native
  npx cap sync android
}

case "${1:-check}" in
  sync)
    sync_android
    ;;
  run)
    sync_android
    npx cap run android
    ;;
  apk)
    sync_android
    cd android
    ./gradlew assembleDebug
    ;;
  aab)
    sync_android
    cd android
    ./gradlew bundleRelease
    ;;
  check)
    sync_android
    cd android
    ./gradlew testReleaseUnitTest lintRelease bundleRelease
    ;;
  *)
    echo "사용법: $0 {sync|run|apk|aab|check}" >&2
    exit 2
    ;;
esac
