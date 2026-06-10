import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import BegimApp from "./BegimApp";
import AdminApp from "./admin/AdminApp";
import LandingPage from "./LandingPage";

function AdminRoute() {
  const navigate = useNavigate();
  return <AdminApp onExit={() => navigate("/")} />;
}

function LandingRoute() {
  const navigate = useNavigate();
  return <LandingPage onEnterShop={() => navigate("/shop")} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/shop/*" element={<BegimApp />} />
        <Route path="*" element={<LandingRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
