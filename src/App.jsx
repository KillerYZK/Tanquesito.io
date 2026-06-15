import { useState } from "react";
import Game from "./mapa/mapa";

export default function Tanquesitos() {
  const [modal, setModal] = useState(null);
  const [usuario, setUsuario] = useState("");
  const [enJuego, setEnJuego] = useState(false);

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
    ["A", "Mover hacia a la izquierda"],
    ["ESC", "Salir al menu"],
    ["Z", "Stats"],
    ["M", "Mapa"],
    ["Tab", "Lista de jugadores"],
    ["V", "Chat"],
  ];

  const cerrar = () => setModal(null);

  if (enJuego) {
    return <Game usuario={usuario} />;
  }

  return (
    <div className="app-container">
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
              setEnJuego(true);
            }
          }}
          className="btn btn-primary"
        >
          Entrar
        </button>
      </div>

      <div className="options-container">
        <button onClick={() => setModal("general")} className="btn-option">
          Configuracion General
        </button>
        <button onClick={() => setModal("sonido")} className="btn-option">
          Sonido
        </button>
        <button onClick={() => setModal("teclas")} className="btn-option">
          Teclas
        </button>
      </div>

      {modal === "general" && (
        <div className="modal-overlay">
          <div className="modal modal-sky">
            <h2 className="modal-title">Configuracion</h2>
            <div className="modal-content">
              <div className="tabs">
                <span className="tab active" onClick={() => setModal("general")}>General</span>
                <span className="tab" onClick={() => setModal("sonido")}>Sonido</span>
                <span className="tab" onClick={() => setModal("teclas")}>Teclas</span>
              </div>

              <h3 style={{ marginTop: "20px" }}>Diseña tu Tanque</h3>
              <div className="colors-grid">
                {colores.map((c, i) => (
                  <div key={i} className="color-box" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="tank-preview">
                <div className="tank-display" />
              </div>

              <h3 style={{ marginTop: "20px" }}>Otras Configuraciones</h3>
              <div className="colors-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
                <div />
                <div className="color-box" style={{ height: "28px", backgroundColor: "#d1d5db" }} />
              </div>
              <div className="action-button-container">
                <button onClick={cerrar} className="btn-accept">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "sonido" && (
        <div className="modal-overlay">
          <div className="modal modal-sky">
            <h2 className="modal-title">Configuracion</h2>
            <div className="modal-content">
              <div className="tabs">
                <span className="tab" onClick={() => setModal("general")}>General</span>
                <span className="tab active" onClick={() => setModal("sonido")}>Sonido</span>
                <span className="tab" onClick={() => setModal("teclas")}>Teclas</span>
              </div>

              <label className="slider-label">Sonido</label>
              <div
                className="slider"
                style={{ background: "linear-gradient(to right, #639922 80%, #ccc 80%)" }}
              />

              <label className="slider-label">Musica</label>
              <div
                className="slider"
                style={{ background: "linear-gradient(to right, #639922 80%, #ccc 80%)" }}
              />

              <div className="action-button-container">
                <button onClick={cerrar} className="btn-accept">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "teclas" && (
        <div className="modal-overlay">
          <div className="modal modal-sky teclas">
            <h2 className="modal-title">Configuracion</h2>
            <div className="modal-content">
              <div className="tabs">
                <span className="tab" onClick={() => setModal("general")}>General</span>
                <span className="tab" onClick={() => setModal("sonido")}>Sonido</span>
                <span className="tab active" onClick={() => setModal("teclas")}>Teclas</span>
              </div>

              <div className="keys-grid">
                {teclas.map(([tecla, accion], i) => (
                  <div key={i} className="key-row">
                    <span className="key-label">{tecla}</span>
                    {accion}
                  </div>
                ))}
              </div>

              <div className="action-button-container">
                <button onClick={cerrar} className="btn-accept">
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