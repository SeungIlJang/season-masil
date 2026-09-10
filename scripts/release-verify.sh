#!/bin/sh

set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TEMP_DIR=$(mktemp -d)

cleanup() {
  find "$TEMP_DIR" -mindepth 1 -delete 2>/dev/null || true
  rmdir "$TEMP_DIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

if [ "${1:-}" = "production" ]; then
  API_BASE_URL=$(sed -n 's/^VITE_API_BASE_URL=//p' .env.production.local .env.local 2>/dev/null | head -n 1 | tr -d '\r' | sed 's/^"//;s/"$//')
  case "$API_BASE_URL" in
    https://*) ;;
    *)
      echo "프로덕션 검사 실패: .env.production.local 또는 .env.local의 VITE_API_BASE_URL에 배포된 HTTPS Worker 주소가 필요합니다." >&2
      exit 1
      ;;
  esac
fi

check_png() {
  path=$1
  expected_width=$2
  expected_height=$3
  width=$(sips -g pixelWidth "$path" 2>/dev/null | awk '/pixelWidth/ {print $2}')
  height=$(sips -g pixelHeight "$path" 2>/dev/null | awk '/pixelHeight/ {print $2}')
  if [ "$width" != "$expected_width" ] || [ "$height" != "$expected_height" ]; then
    echo "그래픽 크기 오류: $path (${width}x${height})" >&2
    exit 1
  fi
}

npm run build
npm audit --omit=dev
node --check worker/src/index.js
npm run android:check

AAB=android/app/build/outputs/bundle/release/app-release.aab
test -s "$AAB"
CERTIFICATE_INFO=$(keytool -printcert -jarfile "$AAB")
if printf '%s' "$CERTIFICATE_INFO" | grep -q 'CN=Android Debug'; then
  echo "릴리스 AAB가 디버그 키로 서명되었습니다." >&2
  exit 1
fi
unzip -q "$AAB" -d "$TEMP_DIR/aab"
node scripts/secret-scan.mjs dist "$TEMP_DIR/aab"

check_png store-assets/icon-512.png 512 512
check_png store-assets/feature-graphic.png 1024 500
check_png store-assets/phone-home.png 1080 1920
check_png store-assets/phone-results.png 1080 1920

echo "릴리스 자동검사: 통과"
echo "Play 업로드 키 서명 AAB 생성 및 인증서 검사: 통과"
if [ "${1:-}" != "production" ]; then
  echo "참고: Worker 배포 후 npm run release:verify:production을 실행해야 최종 업로드용 AAB가 됩니다."
fi
