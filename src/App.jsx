import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 1. ESTADO - useState
  const [nombre, setNombre] = useState("Juan")
  const [edad, setEdad] = useState(25)
  const [texto, setTexto] = useState("")
  const [mostrar, setMostrar] = useState(false)

  // 5. EFECTOS - useEffect
  useEffect(() => {
    console.log("✅ Componente cargado correctamente")
  }, [])

  // 4. LISTAS - Array de datos
  const lenguajes = ["React", "JavaScript", "Vite", "CSS3"]

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🎓 Aprende React - 5 Conceptos Básicos</h1>

      {/* 1. ESTADO */}
      <section style={{ marginTop: "30px", padding: "20px", border: "2px solid blue", borderRadius: "8px" }}>
        <h2>1️⃣ ESTADO (useState)</h2>
        <p>Nombre: <strong>{nombre}</strong></p>
        <p>Edad: <strong>{edad}</strong></p>
        <button onClick={() => setNombre("Carlos")}>
          Cambiar nombre
        </button>
        <button onClick={() => setEdad(edad + 1)} style={{ marginLeft: "10px" }}>
          Cumplir años
        </button>
      </section>

      {/* 2. EVENTOS */}
      <section style={{ marginTop: "30px", padding: "20px", border: "2px solid green", borderRadius: "8px" }}>
        <h2>2️⃣ EVENTOS (onClick, onChange)</h2>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe aquí..."
          style={{ padding: "8px", fontSize: "16px" }}
        />
        <p>Escribiste: <strong>{texto}</strong></p>
        <button onClick={() => alert("¡Botón presionado!")}>
          Presiona aquí
        </button>
      </section>

      {/* 3. CONDICIONALES */}
      <section style={{ marginTop: "30px", padding: "20px", border: "2px solid orange", borderRadius: "8px" }}>
        <h2>3️⃣ CONDICIONALES (if/ternario)</h2>
        <button onClick={() => setMostrar(!mostrar)}>
          {mostrar ? "Ocultar" : "Mostrar"} mensaje
        </button>
        {mostrar && <p style={{ color: "green", fontSize: "18px" }}>✅ ¡Ahora me ves!</p>}
        {mostrar ? <h3>Visible</h3> : <h3>Oculto</h3>}
      </section>

      {/* 4. LISTAS */}
      <section style={{ marginTop: "30px", padding: "20px", border: "2px solid red", borderRadius: "8px" }}>
        <h2>4️⃣ LISTAS (map)</h2>
        <p>Lenguajes que estoy aprendiendo:</p>
        <ul style={{ fontSize: "16px" }}>
          {lenguajes.map((lang, index) => (
            <li key={index}>{lang}</li>
          ))}
        </ul>
      </section>

      {/* 5. EFECTOS */}
      <section style={{ marginTop: "30px", padding: "20px", border: "2px solid purple", borderRadius: "8px" }}>
        <h2>5️⃣ EFECTOS (useEffect)</h2>
        <p>Revisa la consola (F12) - El componente se cargó correctamente 👆</p>
      </section>
    </div>
  )
}

export default App

