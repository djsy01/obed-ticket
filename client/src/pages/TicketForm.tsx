import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { applyTicket } from "../api/ticket";
import "../styles/TicketForm.css";

export default function TicketForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketType, setTicketType] = useState<"student" | "adult">("student");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await applyTicket({ name, email, ticketType });
      setMessage(`✅ 신청 완료! 티켓 ID: ${result.ticketId}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ 신청 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>🎫 티켓 신청</h2>
      <input
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        placeholder="이름"
        required
      />
      <input
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        placeholder="이메일"
        type="email"
        required
      />
      <select
        value={ticketType}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setTicketType(e.target.value as "student" | "adult")
        }
      >
        <option value="student">학생</option>
        <option value="adult">성인</option>
      </select>
      <button type="submit">신청</button>
      <p>{message}</p>
    </form>
  );
}
