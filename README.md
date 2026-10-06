# 모두의 시즌마실

설치 앱은 AAB에 포함된 화면을 기본으로 실행하며, GitHub Pages에 새 웹 번들이 배포되면 안전하게 내려받아 다음 실행부터 자동 반영합니다. 네트워크 또는 업데이트 오류가 발생하면 마지막 정상 화면을 계속 사용합니다.

서울·경기도의 무료·저렴한 공공시설과 사계절 행사를 한곳에서 찾는 Vue/Vite 웹앱입니다.

## 시작하기

1. `.env.local`의 각 항목에 발급받은 인증키를 입력합니다.
2. `npm install`
3. `npm run dev`

로컬 접속 주소는 기본적으로 `http://localhost:5173`입니다.

## 현재 상태

- 서울/경기, 계절, 가격, 키워드 필터 기본 UI
- TourAPI 서울·경기 축제, 서울 열린데이터광장 문화행사, 생활안전지도 계절 시설, 공유누리 공유자원 실데이터 연결
- 개발 서버 프록시를 통한 인증키 비노출 호출
- 행사 카드 공통 데이터 정규화와 API 실패 시 예시데이터 폴백
- 검색·필터·정렬·즐겨찾기·페이지 더보기
- PWA 설치, 오프라인 캐시, 개인정보처리방침 및 데이터 출처 페이지
- Android 16(API 36) 대응 Capacitor 8 앱
- Cloudflare Worker 프로덕션 API 프록시 준비

## Android 검증

Java 21과 Android SDK 36이 설치된 Mac에서 아래 명령을 사용합니다.

```bash
npm run android:check
```

이 명령은 웹 빌드, Capacitor 동기화, Android 린트, 릴리스 AAB 빌드를 차례로 실행합니다. Java 21은 스크립트가 자동으로 선택합니다.

> Play Store 제출 전에는 `capacitor.config.json`과 `android/app/build.gradle`의 영구 패키지 ID를 확정하고, 별도의 업로드 키로 릴리스 서명을 설정해야 합니다.

### AdMob 설정

개발 빌드는 Google 공식 테스트 앱·배너 ID를 사용하고, 프로덕션 빌드는 앱에 설정된 운영 앱·배너 ID를 자동으로 사용합니다. 운영 ID를 임시로 덮어쓸 때만 아래 값을 설정합니다.

```bash
export ADMOB_APP_ID='ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy'
```

`.env.production.local`:

```dotenv
VITE_ADMOB_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy
```

개발 기기에서는 실광고를 직접 클릭하지 않습니다. 출시 전에는 Play Console의 광고 포함 여부와 데이터 보안 응답을 갱신하고, 광고 내용이 반영된 공개 개인정보처리방침을 재배포합니다.

## 프로덕션 API

공개 배포에서는 `worker/`의 Cloudflare Worker를 배포한 뒤 `VITE_API_BASE_URL`을 Worker 주소로 설정합니다. API 인증키는 Worker secret으로만 보관하며 앱 번들에는 포함하지 않습니다.

Worker에 설정할 secret 이름은 `TOUR_API_SERVICE_KEY`, `SEOUL_OPEN_DATA_KEY`, `SAFEMAP_SERVICE_KEY`, `ESHARE_SERVICE_KEY`입니다. 각 출처는 독립 처리되어 일부 API가 실패해도 정상 응답한 다른 출처는 계속 표시됩니다.

스토어 제출 준비 사항은 `PLAY_CONSOLE_CHECKLIST.md`, 등록 문안은 `STORE_LISTING.md`를 참고하세요.

전체 자동검사는 아래 명령으로 실행합니다.

```bash
npm run release:verify
```

Worker 배포 URL을 `.env.local`의 `VITE_API_BASE_URL`에 설정한 최종 업로드 빌드는 아래 명령으로 검증합니다.

```bash
npm run release:verify:production
```

현재 완료 항목과 외부 승인·최종 결정이 필요한 항목은 `STORE_RELEASE_STATUS.md`에 정리되어 있습니다.
