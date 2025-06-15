import { Request, Response } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// 티켓 신청
export const applyTicket = async (req: Request, res: Response) => {
  const { name, email, ticketType } = req.body;

  if (!name || !email || !ticketType) {
    return res.status(400).json({ message: "필수 항목 누락" });
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO tickets (name, email, ticket_type, status) VALUES (?, ?, ?, ?)",
      [name, email, ticketType, "pending"]
    );

    res.status(201).json({
      message: "신청 완료",
      ticketId: result.insertId,
    });
  } catch (err) {
    console.error("DB 삽입 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// 티켓 상태 조회
export const getTicketStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 티켓 없음" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("DB 조회 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};

// 입금 확인 (상태 변경)
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
    console.error("입금 확인 오류:", err);
    res.status(500).json({ message: "DB 오류" });
  }
};
