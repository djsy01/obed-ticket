import { useEffect, useState } from "react";
import {
  getAllTickets,
  requestConfirmByAdmin,
  requestRefundConfirmByAdmin,
  generateQRAndSendEmail,
} from "../api/ticket";
import { createEvent, listEvents } from "../api/event";
import "../styles/AdminPage.css";
import { useNavigate, useParams } from "react-router-dom";

type Ticket = {
  id: number;
  name: string;
  phone: string;
  ticket_type: "student" | "adult";
  quantity: number;
  status: string;
  refund_account?: string;
  created_at: string;
  qr_url?: string;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "💰 입금 대기";
    case "requested":
      return "⌛ 입금 확인 중";
    case "confirmed":
      return "✅ 입금 완료";
    case "refund_requested":
      return "💸 환불 요청됨";
    case "cancelled":
      return "❌ 취소됨";
    case "refunded":
      return "💸 환불 완료";
    default:
      return status;
  }
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [authorized, setAuthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  const { eventId } = useParams(); // ✅ URL에서 eventId 가져오기

  useEffect(() => {
    const adminKey = import.meta.env.VITE_ADMIN_SECRET;
    const storedAuth = localStorage.getItem("isAdmin");

    if (storedAuth === "true") {
      setAuthorized(true);
      return;
    }

    const input = prompt("🔐 관리자 비밀번호를 입력하세요:");
    if (input === adminKey) {
      localStorage.setItem("isAdmin", "true");
      setAuthorized(true);
    } else {
      alert("❌ 접근 권한이 없습니다.");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    listEvents()
      .then((data) => setEvents(data))
      .catch(() => alert("행사 목록 조회 실패"));
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !eventId) return;
    getAllTickets(Number(eventId))
      .then((data: Ticket[]) => {
        const sorted = data.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "ko")
        );
        setTickets(sorted);
      })
      .catch(() => alert("티켓 조회 실패"))
      .finally(() => setLoading(false));
  }, [authorized, eventId]);

  const handleConfirm = async (id: number) => {
    try {
      await requestConfirmByAdmin(Number(eventId), id);
      await generateQRAndSendEmail(Number(eventId), id);

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "confirmed" } : t))
      );

      alert("✅ 입금 확인 + QR 이메일 발송 완료!");
    } catch (err) {
      console.error("❌ 입금 처리 중 오류:", err);
      alert("❌ 입금 처리 또는 QR 이메일 발송 실패");
    }
  };

  const handleRefund = async (id: number) => {
    await requestRefundConfirmByAdmin(Number(eventId), id);
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "refunded" } : t))
    );
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.date) {
        alert("행사 제목과 날짜는 필수 입력 항목입니다.");
        return;
      }
      await createEvent(newEvent);
      alert("✅ 새 행사가 생성되었습니다!");
      setNewEvent({
        title: "",
        date: "",
        location: "",
        description: "",
      });
      listEvents().then((data) => setEvents(data));
    } catch (err) {
      console.error("❌ 행사 생성 실패:", err);
      alert("❌ 행사 생성에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.reload();
  };

  const filteredTickets = tickets.filter((ticket) => {
    const keywordMatch =
      ticket.name.includes(searchText) || ticket.phone.includes(searchText);
    const filterMatch = filter === "all" || ticket.status === filter;
    return keywordMatch && filterMatch;
  });

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + ticketsPerPage
  );

  if (!authorized) return null;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="admin-container">
      <h2>🎫 관리자 페이지</h2>
      <button onClick={handleLogout}>🚪 로그아웃</button>

      <div className="event-creation-section">
        <h3>➕ 새 행사 만들기</h3>
        <label>제목</label>
        <input
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
        />
        <label>날짜</label>
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) =>
            setNewEvent({ ...newEvent, date: e.target.value })
          }
        />
        <label>장소</label>
        <input
          value={newEvent.location}
          onChange={(e) =>
            setNewEvent({ ...newEvent, location: e.target.value })
          }
        />
        <label>설명</label>
        <textarea
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
        />
        <button onClick={handleCreateEvent}>생성</button>
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <h3>🎉 현재 진행 중인 행사</h3>
      <ul>
        {events.map((event: any) => (
          <li key={event.id}>
            <strong>{event.title}</strong> ({new Date(event.date).toLocaleDateString()}) -{" "}
            <a href={`/admin/${event.id}`}>티켓 관리하기</a>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "2rem 0" }} />

      <h3>🎫 티켓 목록 (이벤트 ID: {eventId})</h3>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>전화번호</th>
            <th>티켓 종류</th>
            <th>수량</th>
            <th>상태</th>
            <th>환불 계좌</th>
            <th>요청일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.phone}</td>
              <td>{t.ticket_type === "student" ? "학생" : "성인"}</td>
              <td>{t.quantity}</td>
              <td>{getStatusLabel(t.status)}</td>
              <td>{t.refund_account || "-"}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
              <td>
                {t.status === "requested" && (
                  <button onClick={() => handleConfirm(t.id)}>입금 완료</button>
                )}
                {t.status === "refund_requested" && (
                  <button onClick={() => handleRefund(t.id)}>환불 완료</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredTickets.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          검색 결과가 없습니다.
        </p>
      )}

      {filteredTickets.length > 0 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ◀ 이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            다음 ▶
          </button>
        </div>
      )}
    </div>
  );
}