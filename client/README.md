# 🎫 OBED Ticket - Frontend

모바일에 최적화된 티켓 예매 웹 프론트엔드입니다. Vite + React + TypeScript 기반으로 구성되어 있으며, 사용자 입력을 받아 백엔드(MySQL + Express)에 연결하여 티켓을 신청합니다.

---

## ⚙️ 기술 스택

- React + Vite + TypeScript
- CSS: 기본 CSS 사용 (모바일 대응)
- Axios: API 통신

---

## 📁 프로젝트 구조

---

## 🚀 실행 방법
1. 의존성 설치
``` bash
npm install
```

2. 개발 서버 실행
``` bash
npm run dev
```
- `https://localhost:5173`에서 앱이 실행

---

## 📦 API 연동 정보
- POST /tickets/apply : 티켓 신청
- GET /tickets/:id : 티켓 상태 조회
- 서버 URL은 .env에 VITE_API_URL로 설정
  - VITE_API_URL=https://your-backend-url.com