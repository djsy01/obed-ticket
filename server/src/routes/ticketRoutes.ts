import { Router } from "express";
import {
  applyTicket,
  getTicketByNameAndPhone,
  requestConfirmTicket,
  requestRefundTicket
} from "../controllers/ticketController";

const router = Router();

// ✅ 기본 API 테스트
router.get("/", (req, res) => {
  res.send("🎫 OBED Ticket API is working");
});

// ✅ 티켓 신청
router.post("/", applyTicket);

// ✅ 이름 + 전화번호 조회
router.get("/search", getTicketByNameAndPhone);

// ✅ 관리자: 입금 확인
router.patch("/:id/request-confirm", requestConfirmTicket);

// ✅ 사용자: 송금 완료 요청
router.patch("/:id/request-payment", requestRefundTicket);

export default router;
