import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
  const { authUser, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!authUser ? <Register /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
