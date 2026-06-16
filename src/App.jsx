import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {screen === 'login' && (
          <div>
            <h1>Tanquesitos.io</h1>
            <p>Nombre de Usuario</p>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Escriba aqui"
              onKeyDown={e => e.key === 'Enter' && username.trim() && goTo('design')}
            />
            <button onClick={() => username.trim() && goTo('design')}>
              Entrar
            </button>
          </div>
        )}
    
    {screen === 'design' && (
          <div>
            <h2>Diseña tu Tanque</h2>
            <div>
              {TANK_COLORS.map(c => (
                <span
                  key={c}
                  onClick={() => setTankColor(c)}
                  style={{
                    display: 'inline-block',
                    width: 30,
                    height: 30,
                    background: c,
                    border: tankColor === c ? '3px solid #000' : '1px solid #333',
                    cursor: 'pointer',
                    margin: 3,
                  }}
                />
              ))}
            </div>
            <p>Color seleccionado: <span style={{ color: tankColor }}>■</span> {tankColor}</p>
            <button onClick={() => goTo('game')}>Entrar</button>
          </div>
        )}
    {screen === 'config' && (
          <div>
            <h2>Configuracion</h2>
 
            {}
            <div>
              {['general', 'sonido', 'teclas'].map(t => (
                <button key={t} onClick={() => setConfigTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
 
            {}
            {configTab === 'general' && (
              <div>
                <p>Resolución: 1920x1080</p>
              </div>
            )}
 
            {configTab === 'sonido' && (
              <div>
                <label>Sonido: {soundVol}%</label>
                <input type="range" min="0" max="100" value={soundVol}
                  onChange={e => setSoundVol(+e.target.value)} />
                <label>Musica: {musicVol}%</label>
                <input type="range" min="0" max="100" value={musicVol}
                  onChange={e => setMusicVol(+e.target.value)} />
              </div>
            )}
 
            {}
            {configTab === 'teclas' && (
              <div>
                <p>W — Mover adelante</p>
                <p>S — Mover atrás</p>
                <p>A — Mover izquierda</p>
                <p>D — Mover derecha</p>
                <p>LMB — Disparar</p>
                <p>ESC — Salir al menú</p>
                <p>Z — Stats</p>
                <p>M — Mapa</p>
                <p>Tab — Lista de jugadores</p>
                <p>V — Chat</p>
              </div>
            )}
 
            <button onClick={() => goTo(prevScreen)}>Aceptar</button>
          </div>
        )}
    </>
  )
}

export default App
