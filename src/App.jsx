import { useState } from "react";
import Game from "./mapa/mapa";
import Login from "./Login";
import Register from "./Register";
import "./app.css";

export default function Tanquesitos() {
  const [pantalla, setPantalla] = useState("login"); // "login" | "register" | "config" | "juego"
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [usuario, setUsuario] = useState("");
  const [selectedColor, setSelectedColor] = useState("#29b6e8");
  const [soundVolume, setSoundVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(70);

  const colores = [
    "#29b6e8", "#e8392e", "#3aa845", "#f0d018", "#f29420", "#e23ec0",
    "#2255e8", "#c0231e", "#1f8038", "#c4b418", "#9a5a18", "#7a1ec0",
    "#eeeeee", "#181818",
  ];

  const teclas = [
    ["W", "Mover hacia adelante"],
    ["D", "Mover hacia a la derecha"],
    ["S", "Mover hacia atras"],
    ["LMB", "Disparar"],
    ["A", "Mover hacia la izquierda"],
    ["ESC", "Salir al menu"],
    ["Z", "Stats"],
    ["M", "Mapa"],
    ["Tab", "Lista de jugadores"],
    ["V", "Chat"],
  ];

  const handleLogin = (nombre) => {
    setUsuario(nombre);
    setPantalla("config");
  };

  const handleRegistro = (nombre) => {
    setUsuario(nombre);
    setPantalla("config");
  };

  const abrirModal = (tab) => {
    setActiveTab(tab);
    setModalVisible(true);
  };

  const cerrarModal = () => setModalVisible(false);

  const renderTabContent = () => {
    if (activeTab === "general") {
      return (
        <>
          <h3 className="modal-subtitle">Diseña tu tanque</h3>
          <div className="colors-grid">
            {colores.map((color, index) => (
              <button
                key={index}
                type="button"
                className={`color-box ${selectedColor === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Seleccionar color ${color}`}
              />
            ))}
          </div>
          <div className="tank-preview">
            <div className="tank-display" style={{ backgroundColor: selectedColor }} />
          </div>


          
        </>
      );
    }

    if (activeTab === "sonido") {
      return (
        <>
          <div className="slider-container">
            <label className="slider-label">Efectos de sonido</label>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
            />
            <div className="slider-value">{soundVolume}%</div>
          </div>

          <div className="slider-container">
            <label className="slider-label">Música</label>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
            />
            <div className="slider-value">{musicVolume}%</div>
          </div>
        </>
      );
    }

    return (
      <div className="keys-grid">
        {teclas.map(([tecla, accion], index) => (
          <div key={index} className="key-row">
            <span className="key-label">{tecla}</span>
            <span>{accion}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- Pantallas de auth ---
  if (pantalla === "login") {
    return (
      <Login
        onLogin={handleLogin}
        irARegister={() => setPantalla("register")}
      />
    );
  }

  if (pantalla === "register") {
    return (
      <Register
        onRegistrado={handleRegistro}
        irALogin={() => setPantalla("login")}
      />
    );
  }

  // --- Juego ---
  if (pantalla === "juego") {
    return (
      <Game
        usuario={usuario}
        color={selectedColor}
        volumenSonido={soundVolume}
        volumenMusica={musicVolume}
        onSalir={() => setPantalla("config")}
      />
    );
  }

  // --- Menú / Config (pantalla === "config") ---
  return (
    <div className="app-container">
      <h1 className="app-title">Tanquesitos.io</h1>

      <p style={{ fontSize: "14px", marginTop: "-16px" }}>
        Bienvenido, <strong>{usuario}</strong>
      </p>

      <div className="login-form">
        <button
          onClick={() => setPantalla("juego")}
          className="btn btn-primary"
        >
          ¡Jugar!
        </button>
      </div>

      {!modalVisible && (
        <div className="options-container">
          <button
            type="button"
            onClick={() => abrirModal("general")}
            className="btn-option"
          >
            Configuración
          </button>
          <button
            type="button"
            onClick={() => abrirModal("sonido")}
            className="btn-option"
          >
            Sonido
          </button>
          <button
            type="button"
            onClick={() => abrirModal("teclas")}
            className="btn-option"
          >
            Teclas
          </button>
          <button
            type="button"
            onClick={() => setPantalla("login")}
            className="btn-option"
            style={{ backgroundColor: "rgba(232,57,46,0.3)" }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {modalVisible && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal modal-sky"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="modal-title">Configuración</h2>
            <div className="modal-content">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${activeTab === "general" ? "active" : ""}`}
                  onClick={() => setActiveTab("general")}
                >
                  General
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === "sonido" ? "active" : ""}`}
                  onClick={() => setActiveTab("sonido")}
                >
                  Sonido
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === "teclas" ? "active" : ""}`}
                  onClick={() => setActiveTab("teclas")}
                >
                  Teclas
                </button>
              </div>
              {renderTabContent()}
              <div className="action-button-container">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="btn-accept"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}