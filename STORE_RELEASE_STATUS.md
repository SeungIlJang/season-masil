# 스토어 출시 준비 현황

기준일: 2026-09-03

## 완료

- Vue 3/Vite 앱 및 모바일 반응형 UI
- 서울·경기 검색, 계절·가격·활동 유형·세부 분류 필터, 정렬, 즐겨찾기
- 서울 열린데이터광장·TourAPI·생활안전지도 연동
- 공유누리 서울·경기 API 연동 및 응답 정규화·장애 격리
- 운영 API 연결 및 전체 엔드포인트 HTTP 200 확인
- PWA 설치·오프라인 캐시
- 개인정보처리방침·데이터 출처 페이지
- Cloudflare Worker 운영 배포 및 프로덕션 API 연결
- Capacitor 8, Android 16/API 36 대응
- Android 단위검사·린트 및 Play 업로드 키 서명 AAB 최종 빌드
- 모바일·데스크톱 브라우저 기능/반응형 QA 및 PWA 오프라인 QA
- 앱 아이콘, 대표 그래픽, 휴대전화 스크린샷 2장
- Play Store 등록 문안·출시 노트·데이터 보안 설문 초안
- 웹/AAB 인증키 비포함 검사
- 업로드 키 암호화 iCloud Drive 백업 및 복원 검증
- AdMob 테스트 광고 통합 및 개인정보 동의 흐름 구현 (버전 1.1 / versionCode 2)
- 서울 구·경기도 시군 2단계 필터 및 기기 내 현재 위치 자동 설정 구현

## 외부 승인 또는 최종 결정 필요

- Play Console에서 패키지 ID `com.seasonmasil.app` 최종 사용 가능 여부 확인
- 실제 Android 기기 설치 테스트
- Play Console 내부 테스트 업로드 및 사전 출시 보고서 확인
- AdMob 앱 및 광고 단위 생성 후 운영 ID 설정
- 광고가 반영된 개인정보처리방침 Worker 재배포

## 남은 순서

1. 패키지 ID `com.seasonmasil.app` 최종 확인
2. 실제 Android 기기 설치 QA
3. Play Console 앱 생성 및 내부 테스트 제출
4. 사전 출시 보고서 확인 후 프로덕션 제출
