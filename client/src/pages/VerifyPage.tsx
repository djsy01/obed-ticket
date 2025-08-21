import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyTicket } from "../api/ticket";
import "../styles/VerifyPage.css";

type Ticket = {
  name: string;
  ticketType: "student" | "adult";
  quantity: number;
  createdAt: string;
};

export default function VerifyPage() {
  const { eventId, id } = useParams<{ eventId: string; id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (id && eventId) {
          const res = await verifyTicket(Number(eventId), id);
          setTicket(res.name);
        }
      } catch (err) {
        console.error("❌ verify error:", err);
        setError("❌ 유효하지 않은 티켓입니다.");
      }
    };

    if (id && eventId) fetchTicket();
  }, [id, eventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "날짜 없음" : date.toLocaleString("ko-KR");
  };

  return (
    <div className="verify-container">
      <h2>🎫 OBED 티켓</h2>

      {error ? (
        <div style={{ color: "red", marginTop: "2rem" }}>{error}</div>
      ) : ticket ? (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1.5rem",
            maxWidth: "500px",
            margin: "2rem auto",
            fontSize: "1.1rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1rem" }}>
            ✅ 유효한 티켓입니다
          </p>
          <p>👤 이름: {ticket.name || "-"}</p>
          <p>🎟️ 티켓 종류: {ticket.ticketType === "student" ? "학생" : "성인"}</p>
          <p>🧾 수량: {ticket.quantity}매</p>
          <p>🕓 신청일: {formatDate(ticket.createdAt)}</p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}