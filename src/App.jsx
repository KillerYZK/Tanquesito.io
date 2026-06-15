import { useEffect, useState } from "react";

export default function Tanquesitos() {
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
    ["[W]", "  Mover hacia adelante"],
    ["[D]", "  Mover hacia la derecha"],
    ["[S]", "  Mover hacia atrás"],
    ["[A]", "  Mover hacia la izquierda"],
    ["[LMB]", "  Disparar"],
  ];

  useEffect(() => {
    if (!modalVisible) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setModalVisible(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalVisible]);

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

          <h3 className="modal-subtitle">Otras configuraciones</h3>
          <div className="options-grid">
            <div className="option-box">Dificultad</div>
            <div className="option-box">Velocidad</div>
            <div className="option-box">Distancia de visión</div>
            <div className="option-box">Brillo</div>
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

  return (
    <div className="app-container">
      {/* Pantalla 1: Login */}
      <h1 className="app-title">Tanquesitos.io</h1>

      <div className="login-form">
        <label>Nombre de Usuario</label>
        <input
          type="text"
          placeholder="Escriba aqui"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <button
          onClick={() => {
            if (usuario.trim() === "") {
              alert("Por favor, ingresa un nombre de usuario");
            } else {
              abrirModal("general");
            }
          }}
          className="btn btn-primary"
        >
          Entrar
        </button>
      </div>

      {!modalVisible && (
        <div className="options-container">
          <button type="button" onClick={() => abrirModal("general")} className="btn-option">
            Configuración
          </button>
          <button type="button" onClick={() => abrirModal("sonido")} className="btn-option">
            Sonido
          </button>
          <button type="button" onClick={() => abrirModal("teclas")} className="btn-option">
            Teclas
          </button>
        </div>
      )}

      {modalVisible && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal modal-sky" onClick={(event) => event.stopPropagation()}>
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
                <button onClick={cerrarModal} className="btn-accept">
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