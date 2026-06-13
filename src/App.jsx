import { useState } from "react";

export default function Tanquesitos() {
  const [modal, setModal] = useState(null); // null | 'diseno' | 'general' | 'sonido' | 'teclas'
  const [usuario, setUsuario] = useState("");

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

  return (
    <div className="min-h-screen bg-orange-400 font-mono flex flex-col items-center justify-center gap-8 p-8 relative">
      {/* Pantalla 1: Login */}
      <h1 className="text-4xl -rotate-2">Tanquesitos.io</h1>

      <div className="flex flex-col items-center gap-2 w-64">
        <span className="text-sm">Nombre de Usuario</span>
        <input
          type="text"
          placeholder="Escriba aqui"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full text-center rounded-full bg-gray-300 border-2 border-black py-1"
        />
        <button
          onClick={() => setModal("diseno")}
          className="w-full rounded-full bg-green-200 border-2 border-black py-2 hover:bg-green-300"
        >
          Entrar
        </button>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={() => setModal("general")} className="border border-black rounded px-3 py-1 bg-white/60">
          Configuracion General
        </button>
        <button onClick={() => setModal("sonido")} className="border border-black rounded px-3 py-1 bg-white/60">
          Sonido
        </button>
        <button onClick={() => setModal("teclas")} className="border border-black rounded px-3 py-1 bg-white/60">
          Teclas
        </button>
      </div>

      {/* Pantalla 2: Diseña tu Tanque */}
      {modal === "diseno" && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <div className="bg-orange-400 border-4 border-black rounded p-6 w-11/12 max-w-md relative">
            <button onClick={cerrar} aria-label="Cerrar" className="absolute top-2 right-2 w-7 h-7 bg-white border-2 border-black">
              x
            </button>
            <h2 className="text-center text-2xl mb-4">Diseña tu Tanque</h2>
            <div className="bg-teal-300 border-4 border-black p-4 rounded flex gap-4">
              <div className="grid grid-cols-2 gap-2">
                {colores.map((c, i) => (
                  <div key={i} className="w-9 h-9 border-2 border-black" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex-1 flex items-end justify-end">
                <div className="w-16 h-12 bg-red-600 border-2 border-black rounded" />
              </div>
            </div>
            <div className="text-right mt-4">
              <button onClick={cerrar} className="rounded-full bg-green-200 border-2 border-black px-6 py-1 hover:bg-green-300">
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 3: Configuracion General */}
      {modal === "general" && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <div className="bg-sky-300 border-[6px] border-black rounded p-6 w-11/12 max-w-md">
            <h2 className="text-center text-2xl mb-4">Configuracion</h2>
            <div className="bg-gray-200 p-4 rounded">
              <div className="flex gap-6 text-sm mb-4">
                <span className="underline font-medium" onClick={() => setModal("general")}>General</span>
                <span onClick={() => setModal("sonido")} className="cursor-pointer">Sonido</span>
                <span onClick={() => setModal("teclas")} className="cursor-pointer">Teclas</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
                <div />
                <div className="h-7 bg-gray-300 border-2 border-black rounded-full" />
              </div>
              <div className="text-center mt-6">
                <button onClick={cerrar} className="rounded-full bg-green-200 border-2 border-black px-6 py-1 hover:bg-green-300">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 4: Configuracion Sonido */}
      {modal === "sonido" && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <div className="bg-sky-300 border-[6px] border-black rounded p-6 w-11/12 max-w-md">
            <h2 className="text-center text-2xl mb-4">Configuracion</h2>
            <div className="bg-gray-200 p-4 rounded">
              <div className="flex gap-6 text-sm mb-4">
                <span onClick={() => setModal("general")} className="cursor-pointer">General</span>
                <span className="underline font-medium" onClick={() => setModal("sonido")}>Sonido</span>
                <span onClick={() => setModal("teclas")} className="cursor-pointer">Teclas</span>
              </div>

              <div className="text-sm mb-1">Sonido</div>
              <div
                className="h-6 border-2 border-black rounded-full mb-4"
                style={{ background: "linear-gradient(to right, #639922 80%, #ccc 80%)" }}
              />

              <div className="text-sm mb-1">Musica</div>
              <div
                className="h-6 border-2 border-black rounded-full mb-4"
                style={{ background: "linear-gradient(to right, #639922 80%, #ccc 80%)" }}
              />

              <div className="text-center mt-6">
                <button onClick={cerrar} className="rounded-full bg-green-200 border-2 border-black px-6 py-1 hover:bg-green-300">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 5: Configuracion Teclas */}
      {modal === "teclas" && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <div className="bg-sky-300 border-[6px] border-black rounded p-6 w-11/12 max-w-2xl">
            <h2 className="text-center text-2xl mb-4">Configuracion</h2>
            <div className="bg-gray-200 p-4 rounded">
              <div className="flex gap-6 text-sm mb-4">
                <span onClick={() => setModal("general")} className="cursor-pointer">General</span>
                <span onClick={() => setModal("sonido")} className="cursor-pointer">Sonido</span>
                <span className="underline font-medium" onClick={() => setModal("teclas")}>Teclas</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {teclas.map(([tecla, accion], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="border-2 border-black bg-white px-2 py-1 min-w-[2.5rem] text-center">{tecla}</span>
                    {accion}
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button onClick={cerrar} className="rounded-full bg-green-200 border-2 border-black px-6 py-1 hover:bg-green-300">
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