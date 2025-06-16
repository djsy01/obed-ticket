// src/pages/FindTicket.tsx
import { useState } from "react";
import { searchTicketByNamePhone } from "../api/ticket";
import "../styles/FindTicket.css"

export default function FindTicket() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    try {
      const data = await searchTicketByNamePhone(name, phone);
      setTicket(data);
      setMessage("");
    } catch (err) {
      setTicket(null);
      setMessage("❌ 예매 내역을 찾을 수 없습니다.");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
      <h2>🔍 예매 조회</h2>
      <label>이름</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 홍길동" />
      <label>전화번호</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="예: 01012345678" />
      <button onClick={handleSearch}>예매 조회</button>

      {ticket && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <p><strong>이름:</strong> {ticket.name}</p>
          <p><strong>종류:</strong> {ticket.ticket_type === "student" ? "학생" : "성인"}</p>
          <p><strong>수량:</strong> {ticket.quantity}</p>
          <p><strong>상태:</strong> {ticket.status === "confirmed" ? "입금 완료" : "입금 대기"}</p>
          <p><strong>티켓 코드:</strong> {ticket.ticket_code}</p>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
