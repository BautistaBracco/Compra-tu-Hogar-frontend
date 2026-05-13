import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Home } from "./components/Home";
import { MiPerfil } from "./components/MiPerfil";
import { Landing } from "./components/Landing";
import { AdminPanel } from "./components/AdminPanel";
import { InmobiliariaPanel } from "./components/InmobiliariaPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import "./styles/components/dashboard.css";
import { useState } from "react";
import axios from 'axios';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get('http://localhost:8080/api/v1/health');
      setStatus(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (value) => {
    const val = String(value).toLowerCase();
    if (val === "up" || val === "ok" || val === "online") return "dashboard-status-up";
    if (val === "down" || val === "error" || val === "offline")
      return "dashboard-status-down";
    return "dashboard-status-default";
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1>Compra tu hogar</h1>

        <button type="button" onClick={checkHealth} disabled={loading}>
          {loading ? "Verificando..." : "Chequear ahora"}
        </button>

        {error && <div className="dashboard-error-msg">⚠️ {error}</div>}

        {status && (
          <div className="dashboard-status-grid">
            {Object.entries(status).map(([key, value]) => (
              <div key={key} className="dashboard-health-card">
                <span className="dashboard-health-label">{key.replace("_", " ")}</span>
                <span className={`dashboard-health-value ${getStatusClass(value)}`}>
                  {String(value).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/status" element={<Dashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mi-perfil"
          element={
            <ProtectedRoute>
              <MiPerfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles="administrador">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inmobiliaria"
          element={
            <ProtectedRoute allowedRoles="inmobiliaria">
              <InmobiliariaPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
