import { useState } from "react";
import { getTicketStatus } from "../api/ticket";
import "../styles/TicketStatus.css";

export default function TicketStatus() {
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    try {
      const result = await getTicketStatus(ticketId);
      setStatus(result.status);
      setError("");
    } catch (err) {
      setStatus(null);
      setError("❌ 조회 실패: 존재하지 않는 티켓입니다.");
    }
  };

  return (
    <div className="status-check">
      <h2>📮 티켓 상태 조회</h2>
      <input
        type="text"
        placeholder="티켓 ID 입력"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
      />
      <button onClick={handleCheck}>조회</button>

      {status && <p>✅ 현재 상태: <strong>{status === "confirmed" ? "확정됨" : "대기 중"}</strong></p>}
      {error && <p>{error}</p>}
    </div>
  );
}
