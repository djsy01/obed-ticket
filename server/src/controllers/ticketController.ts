import { Request, Response } from "express";
import { db } from "../db/index";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { sendTelegram } from "../utils/sendTelegram";

// ✅ 티켓 신청
export const applyTicket = async (req: Request, res: Response) => {
  console.log("📥 티켓 신청 요청:", req.body);
  const {
    name,
    email,
    ticketType,
    phone,
    quantity = 1,
    memo = null,
  } = req.body;

  if (!name || !email || !ticketType || !phone) {
    return res.status(400).json({ message: "필수 항목 누락" });
  }

  const ticketCode = uuidv4();

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO tickets
        (name, email, ticket_type, status, phone, quantity, memo, ticket_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, ticketType, "pending", phone, quantity, memo, ticketCode]
    );

    res.status(201).json({
      message: "신청 완료",
      ticketId: result.insertId,
      ticketCode,
    });
  } catch (err) {
    console.error("❌ applyTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 이름 + 전화번호로 조회 (취소되지 않은 모든 티켓 반환)
export const getTicketByNameAndPhone = async (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(String(req.query.name));
    const phone = decodeURIComponent(String(req.query.phone));

    if (!name || !phone) {
      return res.status(400).json({ message: "이름과 전화번호는 필수입니다." });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM tickets
       WHERE name = ? AND phone = ? AND status != 'cancelled'
       ORDER BY created_at DESC`,
      [name, phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "유효한 티켓이 없습니다." });
    }

    res.status(200).json(rows); // ✅ 여러 개의 티켓 반환
  } catch (err) {
    console.error("❌ getTicketsByNameAndPhone 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 입금 확인
export const confirmTicket = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'confirmed' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    res.status(200).json({ message: "입금 확인 완료" });
  } catch (err) {
    console.error("❌ confirmTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 송금 요청 (상태: 'requestConfirmTicket')
export const requestConfirmTicket = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'requested' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    // ✅ 티켓 상세 정보 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    const ticket = rows[0];

    // ✅ 텔레그램 알림 전송
    const message = `📩 *입금 확인 요청 도착*\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR")}`;
    await sendTelegram(message);

    res.status(200).json({ message: "송금 요청 상태로 변경됨" });
  } catch (err) {
    console.error("❌ requestConfirmTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 환불 요청
export const requestRefundTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { refundAccount } = req.body;

  if (!refundAccount) {
    return res.status(400).json({ message: "환불 계좌는 필수입니다." });
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'refund_requested', refund_account = ? WHERE id = ?",
      [refundAccount, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "티켓 없음" });
    }

    // ✅ 티켓 정보 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    const ticket = rows[0];

    // ✅ 텔레그램 알림 전송
    const message = `💸 *환불 요청 도착*\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)\n🏦 환불 계좌: ${ticket.refund_account}\n🕐 요청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR")}`;
    await sendTelegram(message);

    return res.status(200).json({ message: "환불 요청됨" });
  } catch (err) {
    console.error("❌ 환불 요청 실패:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};




// ✅ 예약 취소 요청 (상태: 'cancelled')
export const requestDeleteTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { refundAccount } = req.body;

  try {
    // 현재 상태 확인
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT status FROM tickets WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    const currentStatus = rows[0].status;

    // ✅ 입금 전(pending)인 경우 환불 계좌 없이도 취소 허용
    if (currentStatus === "pending") {
      await db.execute<ResultSetHeader>(
        "UPDATE tickets SET status = 'cancelled' WHERE id = ?",
        [id]
      );
    } else {
      // 입금 이후라면 환불 계좌가 필요함
      if (!refundAccount) {
        return res.status(400).json({ message: "환불 계좌는 필수입니다." });
      }

      await db.execute<ResultSetHeader>(
        "UPDATE tickets SET status = 'cancelled', refund_account = ? WHERE id = ?",
        [refundAccount, id]
      );
    }

    res.status(200).json({ message: "예약이 취소되었습니다." });
  } catch (err) {
    console.error("❌ requestDeleteTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 전체 티켓 조회 (관리자용)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM tickets ORDER BY created_at DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ 전체 티켓 조회 실패:", error);
    res.status(500).json({ message: "전체 조회 실패" });
  }
};

// ✅ 티켓 상태 조회 (개별 티켓용)
export const confirmTicketByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'confirmed' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 티켓을 찾을 수 없습니다." });
    }

    // ✅ 티켓 정보 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    const ticket = rows[0];

    // ✅ 텔레그램 알림 전송
    const message = `🎉 *예약 최종 완료*\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR")}`;
    await sendTelegram(message);

    res.status(200).json({ message: "입금 확인 완료" });
  } catch (error) {
    console.error("❌ 관리자 입금 확인 실패:", error);
    res.status(500).json({ message: "입금 확인 처리 실패" });
  }
};

// ✅ 환불 완료 처리 (관리자용)
export const confirmRefundByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 상태 변경
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'cancelled' WHERE id = ? AND status = 'refund_requested'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "환불 요청 상태의 티켓이 없습니다." });
    }

    // ✅ 환불 티켓 정보 조회
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    const ticket = rows[0];

    // ✅ 텔레그램 알림 전송
    const message = `✅ *환불 완료 처리됨*\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)\n🏦 환불 계좌: ${ticket.refund_account}\n🕐 요청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR")}`;
    await sendTelegram(message);

    res.status(200).json({ message: "환불 완료 처리되었습니다." });
  } catch (err) {
    console.error("❌ confirmRefundByAdmin 오류:", err);
    res.status(500).json({ message: "환불 처리 실패" });
  }
};

