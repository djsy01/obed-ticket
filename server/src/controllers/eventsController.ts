import { Request, Response, NextFunction } from "express";
import { db } from "../db/index";

export const listEvents = async (_: Request, res: Response) => {
  const [rows] = await db.query("SELECT * FROM events ORDER BY date DESC, id DESC");
  res.json(rows);
};

export const getEvent = async (req: Request, res: Response) => {
  const [rows] = await db.query("SELECT * FROM events WHERE id=?", [req.params.id]);
  if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ message: "Event not found" });
  res.json(rows[0]);
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, date, description, location, poster_url } = req.body;
  if (!title || !date) return res.status(400).json({ message: "title, date required" });
  const [r] = await db.query(
    "INSERT INTO events (title, description, date, location, poster_url) VALUES (?, ?, ?, ?, ?)",
    [title, description ?? null, date, location ?? null, poster_url ?? null]
  );
  res.status(201).json({ ok: true, id: (r as any).insertId });
};

export const updateEvent = async (req: Request, res: Response) => {
  const { title, date, description, location, poster_url } = req.body;
  const [r] = await db.query(
    "UPDATE events SET title=?, description=?, date=?, location=?, poster_url=? WHERE id=?",
    [title, description ?? null, date, location ?? null, poster_url ?? null, req.params.id]
  );
  res.json({ ok: true, affected: (r as any).affectedRows });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const [r] = await db.query("DELETE FROM events WHERE id=?", [req.params.id]);
  res.json({ ok: true, affected: (r as any).affectedRows });
};

// 선택: 하위 티켓 라우트 진입 전 이벤트 존재 확인
export const ensureEventExists = async (req: Request, res: Response, next: NextFunction) => {
  const [rows] = await db.query("SELECT id FROM events WHERE id=?", [req.params.id]);
  if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ message: "Event not found" });
  next();
};
