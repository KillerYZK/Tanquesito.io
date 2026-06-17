import { useState } from "react";
import { db } from "./firebase";
import { ref, get } from "firebase/database";

export default function Login({ onLogin, irARegister }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Completa todos los campos.");
      return;
    }

    const usuarioRef = ref(db, `usuarios/${usuario.trim()}`);
    const snapshot = await get(usuarioRef);

    if (!snapshot.exists()) {
      setError("El usuario no existe.");
      return;
    }

    const datos = snapshot.val();
    if (datos.contrasena !== contrasena) {
      setError("Contraseña incorrecta.");
      return;
    }

    onLogin(usuario.trim());
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Tanquesitos.io</h1>

      <div className="login-form">
        <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Iniciar sesión</h2>

        <label>Nombre de Usuario</label>
        <input
          type="text"
          placeholder="Escriba aquí"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {error && (
          <p style={{ color: "#e8392e", fontSize: "13px", margin: "4px 0" }}>
            {error}
          </p>
        )}

        <button onClick={handleLogin} className="btn btn-primary">
          Entrar
        </button>

        <p style={{ fontSize: "13px", marginTop: "8px" }}>
          ¿No tenés cuenta?{" "}
          <span
            onClick={irARegister}
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >
            Registrate
          </span>
        </p>
      </div>
    </div>
  );
}