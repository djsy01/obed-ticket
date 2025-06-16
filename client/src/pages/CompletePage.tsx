import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchTicketByNamePhone, requestConfirm, requestDelete } from "../api/ticket";
import "../styles/CompletePage.css";

const getTicketTypeLabel = (type: string) => {
  return type === "student" ? "학생" : "성인";
};

const formatQuantity = (qty: number) => `${qty}매`;

export default function CompletePage() {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const [ticket, setTicket] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (name && phone) {
      searchTicketByNamePhone(name, phone)
        .then((data) => {
          setTicket(data);
          if (data.status === "requested") setIsConfirming(true);
        })
        .catch(() => {
          alert("예매 정보를 찾을 수 없습니다.");
        });
    }
  }, [name, phone]);

  const handleConfirmClick = async () => {
    try {
      if (!ticket) return;
      await requestConfirm(ticket.id);
      setIsConfirming(true);
    } catch (err) {
      console.error("송금 요청 실패:", err);
      alert("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleCancelClick = async () => {
    if (!ticket) return;

    if (ticket.status === "requested" || ticket.status === "confirmed") {
      navigate("/refund", {
        state: {
          name: ticket.name,
          phone: ticket.phone,
          ticketId: ticket.id,
          ticketType: ticket.ticket_type,
          quantity: ticket.quantity,
        },
      });
    } else {
      const ok = confirm("정말 예약을 취소하시겠습니까?");
      if (!ok) return;
      
      try {
        await requestDelete(ticket.id);
        alert("예약이 취소되었습니다.");
        navigate("/");
      } catch (err) {
        console.error("예약 취소 오류:", err);
        alert("취소 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (!ticket) return <p>로딩 중...</p>;

  const isConfirmed = ticket.status === "confirmed";

  return (
    <div className="complete-container">
      <h2>✅ 예매 완료</h2>
      <p><strong>이름:</strong> {ticket.name}</p>
      <p><strong>전화번호:</strong> {ticket.phone}</p>
      <p><strong>티켓 종류:</strong> {getTicketTypeLabel(ticket.ticket_type)}</p>
      <p><strong>수량:</strong> {formatQuantity(ticket.quantity)}</p>

      <p>
        <strong>상태:</strong>{" "}
        {isConfirmed ? (
          <span className="status-confirmed">✅ 송금 완료</span>
        ) : isConfirming ? (
          <span className="status-pending">⌛ 입금 확인 중</span>
        ) : (
          <span className="status-waiting">💰 입금 대기 중</span>
        )}
      </p>

      {!isConfirmed && !isConfirming && (
        <button className="confirm-btn" onClick={handleConfirmClick}>송금 완료</button>
      )}

      {isConfirming && (
        <p className="confirm-note">
          ※ 송금 정보를 확인 중입니다. <strong>24시간 내 수동 확인</strong> 후 확정됩니다.
        </p>
      )}

      <h4>💳 입금 계좌</h4>
      <p>카카오뱅크 3333-00-0000000 (예금주: OBED)</p>

      <button className="cancel-btn" onClick={handleCancelClick}>❌ 예약 취소</button>
    </div>
  );
}
