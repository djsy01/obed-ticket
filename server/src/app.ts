import express from 'express';
import cors from 'cors';
import ticketRoutes from './routes/ticketRoutes';
import dotenv from 'dotenv';

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

// ✅ 예매 관련 라우터 연결
app.use("/api/tickets", ticketRoutes);

// 핑보내기
app.get("/api/health", (req, res) => {
  res.send("✅ OBED API is alive");
});

export default app;
