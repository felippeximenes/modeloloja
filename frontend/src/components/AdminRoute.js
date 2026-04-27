import { Navigate } from "react-router-dom";
import { isAuthenticated, getStoredUser } from "../services/auth";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
