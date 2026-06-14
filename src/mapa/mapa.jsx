import { useRef, useEffect } from "react";

// --- Configuración ---
const PLAYER_SPEED = 4;
const PLAYER_RADIUS = 20;
const BULLET_SPEED = 8;
const BULLET_RADIUS = 5;
const FIRE_COOLDOWN = 250; // ms

export default function Game() {
  const canvasRef = useRef(null);

  // Estado del juego en un ref (evita re-renders de React por frame)
  const stateRef = useRef({
    player: { x: 0, y: 0, angle: 0, hp: 100 },
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    bullets: [],
    shapes: [],
    lastShot: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Centrar jugador al inicio
    state.player.x = 0;
    state.player.y = 0;

    // --- Generar formas iniciales (cuadrados rojos simples) ---
    for (let i = 0; i < 15; i++) {
      state.shapes.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        size: 30,
        hp: 30,
        maxHp: 30,
        rotation: Math.random() * Math.PI,
      });
    }

    // --- Inputs ---
    function onKeyDown(e) {
      state.keys[e.key.toLowerCase()] = true;
    }
    function onKeyUp(e) {
      state.keys[e.key.toLowerCase()] = false;
    }
    function onMouseMove(e) {
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
    }
    function onMouseDown() {
      state.mouse.down = true;
    }
    function onMouseUp() {
      state.mouse.down = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    let animationId;
    let lastTime = performance.now();

    function update(dt) {
      const { player, keys, mouse, bullets, shapes } = state;

      // Movimiento del jugador (WASD)
      let dx = 0;
      let dy = 0;
      if (keys["w"]) dy -= 1;
      if (keys["s"]) dy += 1;
      if (keys["a"]) dx -= 1;
      if (keys["d"]) dx += 1;

      const len = Math.hypot(dx, dy);
      if (len > 0) {
        player.x += (dx / len) * PLAYER_SPEED;
        player.y += (dy / len) * PLAYER_SPEED;
      }

      // Ángulo del cañón hacia el mouse (centro de pantalla = jugador)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      player.angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

      // Disparo
      const now = performance.now();
      if (mouse.down && now - state.lastShot > FIRE_COOLDOWN) {
        bullets.push({
          x: player.x + Math.cos(player.angle) * PLAYER_RADIUS,
          y: player.y + Math.sin(player.angle) * PLAYER_RADIUS,
          vx: Math.cos(player.angle) * BULLET_SPEED,
          vy: Math.sin(player.angle) * BULLET_SPEED,
          life: 60, // frames de vida
        });
        state.lastShot = now;
      }

      // Actualizar balas
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life -= 1;
        if (b.life <= 0) {
          bullets.splice(i, 1);
          continue;
        }

        // Colisión con shapes
        for (let j = shapes.length - 1; j >= 0; j--) {
          const s = shapes[j];
          const dist = Math.hypot(b.x - s.x, b.y - s.y);
          if (dist < BULLET_RADIUS + s.size / 2) {
            s.hp -= 10;
            bullets.splice(i, 1);
            if (s.hp <= 0) {
              shapes.splice(j, 1);
            }
            break;
          }
        }
      }
    }

    function draw() {
      const { player, bullets, shapes } = state;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Fondo
      ctx.fillStyle = "#cdcdcd";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid (efecto de movimiento)
      ctx.strokeStyle = "#bbbbbb";
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = ((player.x % gridSize) + gridSize) % gridSize;
      const offsetY = ((player.y % gridSize) + gridSize) % gridSize;

      for (let x = -offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Trasladar mundo según la cámara (jugador en el centro)
      ctx.save();
      ctx.translate(centerX - player.x, centerY - player.y);

      // Shapes (cuadrados)
      shapes.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle = "#f0a04b";
        ctx.strokeStyle = "#c9853a";
        ctx.lineWidth = 4;
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.restore();
      });

      // Balas
      ctx.fillStyle = "#9aa7d1";
      bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // Jugador (cuerpo)
      ctx.save();
      ctx.translate(player.x, player.y);

      // Cañón
      ctx.rotate(player.angle);
      ctx.fillStyle = "#888888";
      ctx.fillRect(0, -6, 35, 12);

      ctx.restore();

      // Cuerpo del jugador (círculo, encima del cañón)
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#00b2e1";
      ctx.fill();
      ctx.strokeStyle = "#0089b3";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }

    function loop(time) {
      const dt = time - lastTime;
      lastTime = time;
      update(dt);
      draw();
      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", background: "#cdcdcd" }}
    />
  );
}