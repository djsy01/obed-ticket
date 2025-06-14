// firebase/init.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBGdTd0C8n7mZx2i7f6_nmJ97RTvD_c49w",
  authDomain: "obed-ticket.firebaseapp.com",
  projectId: "obed-ticket",
  storageBucket: "obed-ticket.appspot.com",
  messagingSenderId: "45660241578",
  appId: "1:45660241578:web:067f23ff8c5dbc6c8c1ad3",
  measurementId: "G-K2HKEFE55C",
};

// 앱 초기화
const firebaseApp = initializeApp(firebaseConfig);

// analytics는 브라우저 환경에서만 작동하므로 체크 필요
const analyticsPromise = isSupported().then((yes) =>
  yes ? getAnalytics(firebaseApp) : null
);

export { firebaseApp, analyticsPromise };
