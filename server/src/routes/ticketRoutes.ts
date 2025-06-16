import { Router } from "express";
import {
  applyTicket,
  getTicketByNameAndPhone,
  confirmTicket,
} from "../controllers/ticketController";

const router = Router();

// ✅ 테스트용 기본 GET (브라우저 접근 확인용)
router.get("/", (req, res) => {
  res.send("🎫 OBED Ticket API is working");
});

// 신청
router.post("/", applyTicket);

// 이름 + 전화번호 조회
router.get("/search", getTicketByNameAndPhone);

// 입금 확인 (관리자)
router.patch("/:id/confirm", confirmTicket);

export default router;
