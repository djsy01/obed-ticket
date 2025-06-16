import { Request, Response } from "express";
import { db } from "../db/index";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";

// 티켓 신청
export const applyTicket = async (req: Request, res: Response) => {
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

// 이름 + 전화번호로 조회
export const getTicketByNameAndPhone = async (req: Request, res: Response) => {
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).json({ message: "이름과 전화번호는 필수입니다." });
  }

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM tickets
       WHERE name = ? AND phone = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [name, phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 정보로 티켓을 찾을 수 없습니다." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ getTicketByNameAndPhone 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// 입금 확인
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
