// src/pages/CompletePage.tsx
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchTicketByNamePhone } from "../api/ticket";
import "../styles/CompletePage.css";

export default function CompletePage() {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (name && phone) {
      searchTicketByNamePhone(name, phone).then(setTicket).catch(() => {
        alert("예매 정보를 찾을 수 없습니다.");
      });
    }
  }, [name, phone]);

  if (!ticket) return <p>로딩 중...</p>;

  return (
    <div className="complete-page">
      <h2>✅ 예매 완료</h2>
      <p><strong>이름:</strong> {ticket.name}</p>
      <p><strong>전화번호:</strong> {ticket.phone}</p>
      <p><strong>티켓 종류:</strong> {ticket.ticket_type}</p>
      <p><strong>수량:</strong> {ticket.quantity}</p>
      <p><strong>상태:</strong> {ticket.status === "confirmed" ? "입금 확인됨" : "입금 대기 중"}</p>

      <h4>💳 입금 계좌</h4>
      <p>카카오뱅크 3333-00-0000000 (예금주: OBED)</p>
      <p>※ 입금 후 24시간 내 확인됩니다.</p>
    </div>
  );
}
