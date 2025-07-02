import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import TicketForm from "./pages/TicketForm";
import CompletePage from "./pages/CompletePage";
import FindTicket from "./pages/FindTicket";
import RefundPage from "./pages/RefundPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<TicketForm />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="/find" element={<FindTicket />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
