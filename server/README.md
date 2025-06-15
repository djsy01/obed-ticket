# 🎫 OBED Ticket - Backend

OBED 워십 집회의 티켓 신청 시스템을 위한 백엔드 서버입니다. Express + TypeScript + MySQL 기반으로 구성되어 있으며, Firebase Admin SDK를 사용하여 인증 기능을 추가할 수 있습니다.

---

## ⚙️ 기술 스택
- Node.js + Express + TypeScript
- MySQL: Railway 기반 DB 사용
- Firebase Admin SDK: 인증 및 관리
- dotenv: 환경 변수 관리

---

## 📁 프로젝트 구조

---

## 🔐 .env 예시
```
# ✅ MySQL 설정
DB_HOST=URL
DB_PORT=PORT
DB_USER=root
DB_PASS=your_password_here
DB_NAME=Database

# ✅ Firebase Admin SDK 설정
FIREBASE_PROJECT_ID=ID
FIREBASE_CLIENT_EMAIL=EMAIL
FIREBASE_PRIVATE_KEY=PRIVATE_KEY
```

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

---

## 📦 주요 API
- POST /tickets/apply : 티켓 신청
- GET /tickets/:id : 티켓 상태 조회