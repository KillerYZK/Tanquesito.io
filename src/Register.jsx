import { useState } from "react";
import { db } from "./firebase";
import { ref, get, set } from "firebase/database";

export default function Register({ onRegistrado, irALogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");

  const handleRegistro = async () => {
    setError("");

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (contrasena.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    // Verificar si el usuario ya existe
    const usuarioRef = ref(db, `usuarios/${usuario.trim()}`);
    const snapshot = await get(usuarioRef);

    if (snapshot.exists()) {
      setError("Ese nombre de usuario ya está en uso.");
      return;
    }

    // Guardar usuario nuevo
    await set(usuarioRef, {
      contrasena: contrasena,
      creadoEn: Date.now(),
    });

    onRegistrado(usuario.trim());
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Tanquesitos.io</h1>

      <div className="login-form">
        <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Crear cuenta</h2>

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
          placeholder="Mínimo 4 caracteres"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <label>Confirmar contraseña</label>
        <input
          type="password"
          placeholder="Repite la contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        {error && (
          <p style={{ color: "#e8392e", fontSize: "13px", margin: "4px 0" }}>
            {error}
          </p>
        )}

        <button onClick={handleRegistro} className="btn btn-primary">
          Registrarse
        </button>

        <p style={{ fontSize: "13px", marginTop: "8px" }}>
          ¿Ya tenés cuenta?{" "}
          <span
            onClick={irALogin}
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}