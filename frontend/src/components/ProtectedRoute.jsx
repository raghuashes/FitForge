import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import TopBar, { BottomNav } from "./Navbar.jsx";

export default function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <TopBar />
      <main className="container">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
