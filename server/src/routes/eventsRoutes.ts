import { Router } from "express";
import * as events from "../controllers/eventsController";
import ticketsRouter from "./ticketRoutes";
import { getTicketsForUser } from "../controllers/ticketController";
import multer from 'multer';

// ✅ multer 설정: 업로드 파일을 'server/uploads' 폴더에 저장
const upload = multer({ dest: 'uploads/' });

const router = Router();

// ✅ 이름 + 전화번호로 모든 행사 티켓 조회 (전역)
router.get("/find", getTicketsForUser);

// 행사 CRUD
router.get("/", events.listEvents);
// ✅ createEvent 라우터에 single('poster') 미들웨어 추가
router.post("/", upload.single('poster'), events.createEvent);
router.get("/:id", events.getEvent);
router.put("/:id", events.updateEvent);
router.delete("/:id", events.deleteEvent);

// 행사 존재 확인 (선택, 안전)
router.use("/:id", events.ensureEventExists);

// ★ 여기서 행사 하위 티켓 라우트 마운트
router.use("/:id/tickets", ticketsRouter);

export default router;