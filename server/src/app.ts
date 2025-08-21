import express from 'express';
import cors from 'cors';
import eventsRoutes from './routes/eventsRoutes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS: 환경변수에서 허용된 origin만 허용
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ 포스터 이미지가 저장될 uploads 폴더를 정적 파일로 서빙
// 서버의 루트 디렉토리에 있는 'uploads' 폴더를 가리키도록 수정
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ 행사 관련 라우터 연결
app.use("/api/events", eventsRoutes);

// 핑보내기
app.get("/api/health", (req, res) => {
  res.send("✅ OBED API is alive");
});

export default app;