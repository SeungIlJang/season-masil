# 배포 마무리 절차

현재 소스·API·웹/PWA·Android 빌드·스토어 자산은 자동검사를 통과했습니다. 아래 단계에는 Cloudflare/Play 외부 계정 또는 승일님의 연락처 결정이 필요합니다.

## 1. 지원 이메일 확정 (완료)

지원 이메일은 `jasi798@gmail.com`으로 확정했습니다. Worker 배포 시 `SUPPORT_EMAIL`로 등록하면 공개 개인정보처리방침이 `/privacy`에 생성됩니다.

## 2. Cloudflare Worker 배포 (완료)

배포 주소: `https://season-masil-api.season-masil.workers.dev`

```bash
npx wrangler login
npx wrangler secret put TOUR_API_SERVICE_KEY --config worker/wrangler.jsonc
npx wrangler secret put SEOUL_OPEN_DATA_KEY --config worker/wrangler.jsonc
npx wrangler secret put SAFEMAP_SERVICE_KEY --config worker/wrangler.jsonc
npx wrangler secret put ESHARE_SERVICE_KEY --config worker/wrangler.jsonc
npx wrangler secret put SUPPORT_EMAIL --config worker/wrangler.jsonc
npm run worker:deploy
```

배포 후 다음 주소를 확인합니다.

- `https://<worker-domain>/health`
- `https://<worker-domain>/api/events`
- `https://<worker-domain>/privacy`
- `https://<worker-domain>/data-sources`

## 3. 최종 업로드 AAB 생성 (완료)

배포된 Worker 주소는 `.env.production.local`의 `VITE_API_BASE_URL`에 반영했습니다.

```bash
npm run release:verify:production
```

완성 파일: `android/app/build/outputs/bundle/release/app-release.aab`

2026년 9월 3일 `release:verify:production` 통과. 최종 AAB SHA-256: `175fd856377d16dc0ffd5ffb4709baba0714b4d098d941bd8c6f9173cd5acfcb`

## 4. 업로드 키 백업

다음 두 파일을 Mac 외부의 암호화된 저장소에 함께 백업합니다. 메시지나 공개 저장소로 보내지 않습니다.

- `android/season-masil-upload.jks`
- `android/keystore.properties`

## 5. Play 내부 테스트

패키지 ID `com.seasonmasil.app`으로 앱을 생성하기 전 사용 가능 여부를 마지막으로 확인합니다. 공개 개인정보처리방침 URL에는 Worker의 `/privacy` 주소를 입력하고, 최종 AAB를 내부 테스트 트랙에 업로드한 뒤 실제 기기와 사전 출시 보고서를 확인합니다.
