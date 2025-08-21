import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  searchTicketByNamePhone,
  requestConfirm,
  requestDelete,
} from "../api/ticket";
import "../styles/CompletePage.css";

const getTicketTypeLabel = (type: string) =>
  type === "student" ? "학생" : "성인";

const formatQuantity = (qty: number) => `${qty}매`;

const TICKET_PRICES: Record<string, number> = {
  student: 5000,
  adult: 10000,
};

const getTicketPrice = (type: string) => TICKET_PRICES[type] || 0;

const formatPrice = (price: number) =>
  price.toLocaleString("ko-KR") + "원";

export default function CompletePage() {
  const [searchParams] = useSearchParams();
  const eventId = Number(searchParams.get("eventId"));
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (name && phone && eventId) {
      searchTicketByNamePhone(eventId, name, phone)
        .then((data) => {
          setTickets(Array.isArray(data) ? data : [data]);
        })
        .catch(() => {
          alert("예매 정보를 찾을 수 없습니다.");
        })
        .finally(() => setLoading(false));
    }
  }, [name, phone, eventId]);

  const handleConfirmClick = async (ticketId: number) => {
    try {
      await requestConfirm(eventId, ticketId);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: "requested" } : t
        )
      );
    } catch (err) {
      console.error("송금 요청 실패:", err);
      alert("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleCancelClick = async (ticket: any) => {
    const { id, name, phone, ticket_type, quantity, status } = ticket;

    if (status === "pending") {
      const ok = confirm("정말 예약을 취소하시겠습니까?");
      if (!ok) return;

      try {
        await requestDelete(eventId, id, "");
        alert("예약이 취소되었습니다.");
        setTickets((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("예약 취소 오류:", err);
        alert("오류가 발생했습니다.");
      }
    } else if (status === "requested" || status === "confirmed") {
      navigate("/refund", {
        state: {
          eventId,
          name,
          phone,
          ticketId: id,
          ticketType: ticket_type,
          quantity,
          refundMode: "refund",
        },
      });
    } else {
      alert("이미 취소되었거나 환불이 진행 중입니다.");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (tickets.length === 0) return <p>유효한 예매 내역이 없습니다.</p>;

  return (
    <div className="complete-container">
      <h2>✅ 예매 완료</h2>

      <h4>💳 입금 계좌</h4>
      <p>카카오뱅크 7979-05-91479 (예금주: 김미정)</p>

      {tickets.map((ticket) => {
        const isConfirmed = ticket.status === "confirmed";
        const isConfirming = ticket.status === "requested";
        const totalPrice = getTicketPrice(ticket.ticket_type) * ticket.quantity;

        return (
          <div key={ticket.id} className="ticket-box">
            <p><strong>이름:</strong> {ticket.name}</p>
            <p><strong>전화번호:</strong> {ticket.phone}</p>
            <p><strong>티켓 종류:</strong> {getTicketTypeLabel(ticket.ticket_type)}</p>
            <p><strong>수량:</strong> {formatQuantity(ticket.quantity)}</p>
            <p><strong>총 금액:</strong> {formatPrice(totalPrice)}</p>
            <p>
              <strong>상태:</strong>{" "}
              {ticket.status === "confirmed" ? (
                <span className="status-confirmed">✅ 송금 완료</span>
              ) : ticket.status === "requested" ? (
                <span className="status-pending">⌛ 입금 확인 중</span>
              ) : ticket.status === "refund_requested" ? (
                <span className="status-refunding">💸 환불 요청됨</span>
              ) : (
                <span className="status-waiting">💰 입금 대기 중</span>
              )}
            </p>

            {!isConfirmed && !isConfirming && (
              <button
                className="confirm-btn"
                onClick={() => handleConfirmClick(ticket.id)}
              >
                송금 완료
              </button>
            )}

            {isConfirming && (
              <p className="confirm-note">
                ※ 송금 정보를 확인 중입니다. <strong>24시간 내 수동 확인</strong> 후 확정됩니다.
              </p>
            )}

            <button
              className="cancel-btn"
              onClick={() => handleCancelClick(ticket)}
            >
              ❌ 예약 취소
            </button>

            <hr />
          </div>
        );
      })}
    </div>
  );
}