# Geulpi Calendar 설정 가이드

기존 프로젝트 사용: `geulpi-prod`

## 1. 기존 설정 확인

Google Cloud Console에서 기존 설정을 확인해주세요:
https://console.cloud.google.com/apis/credentials?project=geulpi-prod

## 2. OAuth 2.0 설정 확인

1. [API 자격증명 페이지](https://console.cloud.google.com/apis/credentials?project=geulpi-prod) 방문
2. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 클릭
3. 동의 화면 구성:
   - 사용자 유형: 외부
   - 앱 이름: Geulpi Calendar
   - 지원 이메일: 본인 이메일
   - 범위 추가: 
     - Google Calendar API
     - Gmail API
     - People API
4. OAuth 클라이언트 생성:
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름: Geulpi Calendar Web
   - 승인된 리디렉션 URI:
     - http://localhost:3000/auth/google/callback
     - http://localhost:8080/auth/google/callback

## 3. API 키 생성

1. [API 자격증명 페이지](https://console.cloud.google.com/apis/credentials?project=geulpi-test-0731)에서
2. "사용자 인증 정보 만들기" > "API 키" 클릭
3. 생성된 키 제한:
   - 애플리케이션 제한사항: HTTP 참조자
   - 웹사이트 제한사항: 
     - http://localhost:3000/*
     - http://localhost:8080/*
   - API 제한사항: 
     - Maps JavaScript API
     - Places API

## 4. 완료 후 실행

위 설정이 완료되면 다음 정보를 준비해주세요:
- OAuth Client ID
- OAuth Client Secret  
- Maps API Key
- OpenAI API Key (별도 준비)

그러면 제가 나머지 설정을 완료해드리겠습니다.