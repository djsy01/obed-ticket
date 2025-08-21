import { Request, Response } from "express";
import { db } from "../db/index";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { sendTelegram } from "../utils/sendTelegram";
import { generateQRCode } from "../utils/qrcode";
import { sendTicketEmail } from "../utils/sendEmail";

/** 공통: 이벤트 제목 조회(텔레그램 메시지에 쓰고 싶을 때) */
async function getEventTitle(eventId: number): Promise<string | null> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT title FROM events WHERE id=?", [eventId]);
  return rows[0]?.title ?? null;
}

// ✅ 티켓 신청 (행사 하위)
export const applyTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  console.log("📥 티켓 신청 요청:", { eventId, ...req.body });

  const { name, email, ticketType, phone, quantity = 1, memo = null } = req.body;
  if (!name || !email || !ticketType || !phone) {
    return res.status(400).json({ message: "필수 항목 누락" });
  }

  const ticketCode = uuidv4();

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO tickets
        (event_id, name, email, ticket_type, status, phone, quantity, memo, ticket_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, name, email, ticketType, "pending", phone, quantity, memo, ticketCode]
    );

    res.status(201).json({
      message: "신청 완료",
      ticketId: result.insertId,
      ticketCode,
      eventId,
    });
  } catch (err) {
    console.error("❌ applyTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 이름 + 전화번호 조회 (행사 한정)
export const getTicketByNameAndPhone = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const name = decodeURIComponent(String(req.query.name));
    const phone = decodeURIComponent(String(req.query.phone));

    if (!name || !phone) {
      return res.status(400).json({ message: "이름과 전화번호는 필수입니다." });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM tickets
       WHERE event_id = ? AND name = ? AND phone = ? AND status != 'cancelled'
       ORDER BY created_at DESC`,
      [eventId, name, phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "유효한 티켓이 없습니다." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ getTicketsByNameAndPhone 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 이름 + 전화번호로 모든 행사 티켓 조회 (전역)
export const getTicketsForUser = async (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(String(req.query.name));
    const phone = decodeURIComponent(String(req.query.phone));

    if (!name || !phone) {
      return res.status(400).json({ message: "이름과 전화번호는 필수입니다." });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.*, e.title AS event_title, e.date AS event_date
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.name = ? AND t.phone = ? AND t.status != 'cancelled'
       ORDER BY e.date DESC`,
      [name, phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "유효한 티켓이 없습니다." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ getTicketsForUser 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 입금 확인 (행사 한정)
export const confirmTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { id } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'confirmed' WHERE id = ? AND event_id = ?",
      [id, eventId]
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

// ✅ 송금 확인 요청 (행사 한정)
export const requestConfirmTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { ticketId } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'requested' WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );
    const ticket = rows[0];
    const title = await getEventTitle(eventId);

    const message =
      `📩 *입금 확인 요청 도착*${title ? `\n📅 행사: ${title}` : ""}` +
      `\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}` +
      `\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)` +
      `\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    await sendTelegram(message);

    res.status(200).json({ message: "송금 요청 상태로 변경됨" });
  } catch (err) {
    console.error("❌ requestConfirmTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 환불 요청 (행사 한정)
export const requestRefundTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { ticketId } = req.params;
  const { refundAccount } = req.body;

  if (!refundAccount) {
    return res.status(400).json({ message: "환불 계좌는 필수입니다." });
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'refund_requested', refund_account = ? WHERE id = ? AND event_id = ?",
      [refundAccount, ticketId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "티켓 없음" });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );
    const ticket = rows[0];
    const title = await getEventTitle(eventId);

    const message =
      `💸 *환불 요청 도착*${title ? `\n📅 행사: ${title}` : ""}` +
      `\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}` +
      `\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)` +
      `\n🏦 환불 계좌: ${ticket.refund_account}` +
      `\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    await sendTelegram(message);

    return res.status(200).json({ message: "환불 요청됨" });
  } catch (err) {
    console.error("❌ 환불 요청 실패:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

// ✅ 예약 취소 (행사 한정)
export const requestDeleteTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { ticketId } = req.params;
  const { refundAccount } = req.body;

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT status FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    const currentStatus = rows[0].status;

    if (currentStatus === "pending") {
      await db.execute<ResultSetHeader>(
        "UPDATE tickets SET status = 'cancelled' WHERE id = ? AND event_id = ?",
        [ticketId, eventId]
      );
    } else {
      if (!refundAccount) {
        return res.status(400).json({ message: "환불 계좌는 필수입니다." });
      }
      await db.execute<ResultSetHeader>(
        "UPDATE tickets SET status = 'cancelled', refund_account = ? WHERE id = ? AND event_id = ?",
        [refundAccount, ticketId, eventId]
      );
    }

    res.status(200).json({ message: "예약이 취소되었습니다." });
  } catch (err) {
    console.error("❌ requestDeleteTicket 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// ✅ 전체 티켓 조회(관리자) — 행사별 목록으로 바꾸는 게 안전
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const [rows] = await db.query("SELECT * FROM tickets WHERE event_id = ? ORDER BY created_at DESC", [eventId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ 전체 티켓 조회 실패:", error);
    res.status(500).json({ message: "전체 조회 실패" });
  }
};

// ✅ 관리자: 입금 확인 (행사 한정)
export const confirmTicketByAdmin = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { ticketId } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'confirmed' WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 티켓을 찾을 수 없습니다." });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );
    const ticket = rows[0];
    const title = await getEventTitle(eventId);

    const message =
      `🎉 *예약 최종 완료*${title ? `\n📅 행사: ${title}` : ""}` +
      `\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}` +
      `\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)` +
      `\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    await sendTelegram(message);

    res.status(200).json({ message: "입금 확인 완료" });
  } catch (error) {
    console.error("❌ 관리자 입금 확인 실패:", error);
    res.status(500).json({ message: "입금 확인 처리 실패" });
  }
};

// ✅ 관리자: 환불 완료 (행사 한정)
export const confirmRefundByAdmin = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const { ticketId } = req.params;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET status = 'cancelled' WHERE id = ? AND event_id = ? AND status = 'refund_requested'",
      [ticketId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "환불 요청 상태의 티켓이 없습니다." });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );
    const ticket = rows[0];
    const title = await getEventTitle(eventId);

    const message =
      `✅ *환불 완료 처리됨*${title ? `\n📅 행사: ${title}` : ""}` +
      `\n👤 이름: ${ticket.name}\n📞 전화번호: ${ticket.phone}` +
      `\n🎫 티켓: ${ticket.ticket_type} (${ticket.quantity}매)` +
      `\n🏦 환불 계좌: ${ticket.refund_account}` +
      `\n🕐 신청 시간: ${new Date(ticket.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    await sendTelegram(message);

    res.status(200).json({ message: "환불 완료 처리되었습니다." });
  } catch (err) {
    console.error("❌ confirmRefundByAdmin 오류:", err);
    res.status(500).json({ message: "환불 처리 실패" });
  }
};

// ✅ QR 생성/메일 발송 (행사 한정)
export const confirmTicketWithQR = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const ticketId = Number(req.params.ticketId);

  try {
    const [rows] = await db.query("SELECT * FROM tickets WHERE id = ? AND event_id = ?", [ticketId, eventId]);
    const ticket = (rows as RowDataPacket[])[0];

    if (!ticket) return res.status(404).json({ error: "티켓 없음" });

    if (ticket.qr_url) {
      await sendTicketEmail(ticket.email, ticket.name, ticket.qr_url);
      return res.status(200).json({ message: "✅ 이미 QR이 존재하여 이메일만 재전송됨" });
    }

    const qrData = `https://obed-ticket.vercel.app/verify/${ticket.id}`;
    const qrImage = await generateQRCode(qrData);

    if (ticket.status !== "confirmed") {
      await db.query(
        "UPDATE tickets SET status = 'confirmed', qr_url = ? WHERE id = ? AND event_id = ?",
        [qrImage, ticketId, eventId]
      );
    } else {
      await db.query(
        "UPDATE tickets SET qr_url = ? WHERE id = ? AND event_id = ?",
        [qrImage, ticketId, eventId]
      );
    }

    await sendTicketEmail(ticket.email, ticket.name, qrImage);

    res.status(200).json({ message: "✅ QR 생성 및 이메일 전송 완료" });
  } catch (err) {
    console.error("❌ QR 처리 중 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// ✅ QR 스캔 검증 (행사 한정)
export const verifyTicket = async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  const ticketId = Number(req.params.id);

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ? AND event_id = ?",
      [ticketId, eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "❌ 티켓이 존재하지 않습니다." });
    }

    const ticket = rows[0];

    if (ticket.status !== "confirmed") {
      return res.status(400).json({ message: "❌ 유효하지 않은 티켓입니다." });
    }

    res.status(200).json({
      message: "✅ 유효한 티켓입니다.",
      name: ticket.name,
      ticketType: ticket.ticket_type,
      quantity: ticket.quantity,
      createdAt: ticket.created_at,
    });
  } catch (err) {
    console.error("❌ verifyTicket 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};