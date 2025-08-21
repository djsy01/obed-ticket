import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import EventsPage from "./pages/EventsPage";
import TicketForm from "./pages/TicketForm";
import CompletePage from "./pages/CompletePage";
import FindTicket from "./pages/FindTicket";
import RefundPage from "./pages/RefundPage";
import AdminPage from "./pages/AdminPage";
import AdminTicketsPage from "./pages/AdminTicketsPage"; // ✅ 추가: AdminTicketsPage 임포트
import VerifyPage from "./pages/VerifyPage";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<EventsPage />} />
        <Route path="/events/:eventId/apply" element={<TicketForm />} />
        <Route path="/find" element={<FindTicket />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:eventId/tickets" element={<AdminTicketsPage />} />
        <Route path="/verify/:eventId/:id" element={<VerifyPage />} />
      </Routes>
    </Router>
  );
}