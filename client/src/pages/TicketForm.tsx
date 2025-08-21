import { useState } from "react";
import { applyTicket } from "../api/ticket";
import { useNavigate } from "react-router-dom";
import "../styles/TicketForm.css";

export default function TicketForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketType, setTicketType] = useState<"" | "student" | "adult">("");
  const [quantity, setQuantity] = useState(1);
  const [memo, setMemo] = useState("");
  const eventId = 1; // ✅ 여기에 이벤트 ID를 직접 입력

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketType) {
      alert("티켓 종류를 선택해주세요.");
      return;
    }

    try {
      const data = { name, email, phone, ticketType, quantity, memo };
      await applyTicket(eventId, data); // ✅ eventId 인자 추가

      const encodedName = encodeURIComponent(name);
      const encodedPhone = encodeURIComponent(phone);
      // ✅ `complete` 페이지로 이동할 때도 eventId를 쿼리 파라미터로 전달해야 합니다.
      navigate(`/complete?eventId=${eventId}&name=${encodedName}&phone=${encodedPhone}`);
    } catch (err) {
      alert("❌ 예매에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h2>🎫 티켓 신청</h2>

      <label>이름</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />

      <label>이메일</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

      <label>전화번호</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <label>티켓 종류</label>
      <small style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
        대학생은 성인으로 선택해주세요
      </small>
      <select
        value={ticketType}
        onChange={(e) => setTicketType(e.target.value as "student" | "adult")}
        required
      >
        <option value="">티켓 종류를 선택하세요</option>
        <option value="student">학생</option>
        <option value="adult">성인</option>
      </select>

      <label>수량</label>
      <input
        type="number"
        value={quantity}
        min={1}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <label>메모 (선택)</label>
      <input value={memo} onChange={(e) => setMemo(e.target.value)} />

      <button type="submit">예매하기</button>
    </form>
  );
}