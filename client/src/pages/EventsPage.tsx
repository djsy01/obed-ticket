import { useEffect, useState } from "react";
import { listEvents } from "../api/event";
import { Link } from "react-router-dom";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => {
        console.error("❌ 행사 목록 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>행사 목록을 불러오는 중...</div>;
  if (events.length === 0) return <div>등록된 행사가 없습니다.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>진행 중인 행사</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {events.map((event: any) => (
          <li key={event.id} style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
            <h3>{event.title}</h3>
            <p>날짜: {new Date(event.date).toLocaleDateString()}</p>
            <p>장소: {event.location}</p>
            <Link to={`/events/${event.id}/apply`}>티켓 신청하기</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}