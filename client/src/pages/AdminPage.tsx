import { useEffect, useState } from "react";
import { createEvent, listEvents } from "../api/event";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
};

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const navigate = useNavigate();

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
      .then((data) => {
        setEvents(data);
      })
      .catch(() => alert("행사 목록 조회 실패"))
      .finally(() => setLoading(false));
  }, [authorized]);

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
            <a href={`/admin/${event.id}/tickets`}>티켓 관리하기</a>
          </li>
        ))}
      </ul>
    </div>
  );
}