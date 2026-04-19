import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-ignore
import { Login } from "./components/Login";
// @ts-ignore
import { Register } from "./components/Register";
// @ts-ignore
import { Home } from "./components/Home";
// @ts-ignore
import { Landing } from "./components/Landing";
import "./App.css";
import { useState } from "react";

// Componente Dashboard (página de inicio - health check)
function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/health");
      if (!res.ok) throw new Error("Error en el servidor");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (value: any) => {
    const val = String(value).toLowerCase();
    if (val === "up" || val === "ok" || val === "online") return "status-up";
    if (val === "down" || val === "error" || val === "offline")
      return "status-down";
    return "status-default";
  };

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        <h1>Compra tu hogar</h1>

        <button type="button" onClick={checkHealth} disabled={loading}>
          {loading ? "Verificando..." : "Chequear ahora"}
        </button>

        {error && <div className="error-msg">⚠️ {error}</div>}

        {status && (
          <div className="status-grid">
            {Object.entries(status).map(([key, value]) => (
              <div key={key} className="health-card">
                <span className="health-label">{key.replace("_", " ")}</span>
                <span className={`health-value ${getStatusClass(value)}`}>
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

