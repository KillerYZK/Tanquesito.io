import { useRef, useEffect } from "react";
import { db } from "../firebase";
import {
  ref,
  set,
  onValue,
  onDisconnect,
  remove,
  update as fbUpdate,
  push,
} from "firebase/database";

// --- Constantes principales del juego ---
const PLAYER_SPEED = 4;
const PLAYER_RADIUS = 20;
const BULLET_SPEED = 8;
const BULLET_RADIUS = 5;
const FIRE_COOLDOWN = 250;
const MAX_HP = 100;
const BULLET_DAMAGE = 10;
const RESPAWN_TIME = 3000; // ms

export default function Game({ usuario, color = "#00b2e1" }) {
  const canvasRef = useRef(null);

  // Estado global del juego, almacenado en una referencia para evitar rerenders
  const stateRef = useRef({
    player: { x: 0, y: 0, angle: 0, hp: MAX_HP, alive: true, respawnAt: 0 },
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    shapes: [],
    otherPlayers: {},
    remoteBullets: [],
    lastShot: 0,
    playerId: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    // --- Inicialización del canvas y reciclado de tamaño ---
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // --- Posición inicial aleatoria para el jugador ---
    function spawnPosition() {
      return {
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
      };
    }

    const start = spawnPosition();
    state.player.x = start.x;
    state.player.y = start.y;

    // --- Registrar jugador en Firebase ---
    const playersRef = ref(db, "players");
    const newPlayerRef = push(playersRef);
    state.playerId = newPlayerRef.key;

    set(newPlayerRef, {
      nombre: usuario,
      x: state.player.x,
      y: state.player.y,
      angle: 0,
      hp: MAX_HP,
      color: color,
    });

    onDisconnect(newPlayerRef).remove();

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const others = {};
      Object.keys(data).forEach((id) => {
        if (id !== state.playerId) others[id] = data[id];
      });
      state.otherPlayers = others;
    });

    // --- Shapes compartidas ---
    const shapesRef = ref(db, "shapes");
    onValue(
      shapesRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          const initialShapes = {};
          for (let i = 0; i < 15; i++) {
            initialShapes[`shape_${i}`] = {
              x: (Math.random() - 0.5) * 2000,
              y: (Math.random() - 0.5) * 2000,
              size: 30,
              hp: 30,
              maxHp: 30,
              rotation: Math.random() * Math.PI,
            };
          }
          set(shapesRef, initialShapes);
        }
      },
      { onlyOnce: true }
    );

    const unsubscribeShapes = onValue(shapesRef, (snapshot) => {
      const data = snapshot.val() || {};
      state.shapes = Object.keys(data).map((id) => ({ id, ...data[id] }));
    });

    // --- Balas compartidas ---
    const bulletsRef = ref(db, "bullets");
    const unsubscribeBullets = onValue(bulletsRef, (snapshot) => {
      const data = snapshot.val() || {};
      state.remoteBullets = Object.keys(data).map((id) => ({ id, ...data[id] }));
    });

    // --- Manejo de entradas de teclado y ratón ---
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
    let lastSync = 0;
    const SYNC_INTERVAL = 50;

    function respawnPlayer() {
      const pos = spawnPosition();
      state.player.x = pos.x;
      state.player.y = pos.y;
      state.player.hp = MAX_HP;
      state.player.alive = true;
      fbUpdate(ref(db, `players/${state.playerId}`), {
        x: pos.x,
        y: pos.y,
        hp: MAX_HP,
      });
    }

    function update(dt) {
      const { player, keys, mouse, shapes, remoteBullets } = state;

      const now = performance.now();

      // --- Lógica de juego: respawn, movimiento y disparo ---
      if (!player.alive) {
        if (now >= player.respawnAt) {
          respawnPlayer();
        }
        return;
      }

      // Movimiento del jugador (WASD)
      let dx = 0,
        dy = 0;
      if (keys["w"]) dy -= 1;
      if (keys["s"]) dy += 1;
      if (keys["a"]) dx -= 1;
      if (keys["d"]) dx += 1;

      const len = Math.hypot(dx, dy);
      if (len > 0) {
        player.x += (dx / len) * PLAYER_SPEED;
        player.y += (dy / len) * PLAYER_SPEED;
      }

      // Ángulo del cañón hacia el mouse
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      player.angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

      // Disparo
      if (mouse.down && now - state.lastShot > FIRE_COOLDOWN) {
        const newBulletRef = push(bulletsRef);
        set(newBulletRef, {
          x: player.x + Math.cos(player.angle) * PLAYER_RADIUS,
          y: player.y + Math.sin(player.angle) * PLAYER_RADIUS,
          vx: Math.cos(player.angle) * BULLET_SPEED,
          vy: Math.sin(player.angle) * BULLET_SPEED,
          life: 60,
          owner: state.playerId,
        });
        state.lastShot = now;
      }

      // --- Recibir daño de balas enemigas ---
      for (let i = remoteBullets.length - 1; i >= 0; i--) {
        const b = remoteBullets[i];
        if (b.owner === state.playerId) continue; // no me daño a mí mismo

        const dist = Math.hypot(b.x - player.x, b.y - player.y);
        if (dist < BULLET_RADIUS + PLAYER_RADIUS) {
          // Solo quien recibe el golpe gestiona su propia HP
          player.hp -= BULLET_DAMAGE;
          remove(ref(db, `bullets/${b.id}`));

          if (player.hp <= 0) {
            player.hp = 0;
            player.alive = false;
            player.respawnAt = now + RESPAWN_TIME;
            fbUpdate(ref(db, `players/${state.playerId}`), { hp: 0 });
          } else {
            fbUpdate(ref(db, `players/${state.playerId}`), { hp: player.hp });
          }
          break;
        }
      }

      // --- Cada cliente gestiona el movimiento de las balas que disparó ---
      remoteBullets.forEach((b) => {
        if (b.owner !== state.playerId) return;

        let nx = b.x + b.vx;
        let ny = b.y + b.vy;
        let nlife = b.life - 1;
        let hit = false;

        // Colisión con shapes
        for (const s of shapes) {
          const dist = Math.hypot(nx - s.x, ny - s.y);
          if (dist < BULLET_RADIUS + s.size / 2) {
            const newHp = s.hp - 10;
            if (newHp <= 0) {
              remove(ref(db, `shapes/${s.id}`));
            } else {
              fbUpdate(ref(db, `shapes/${s.id}`), { hp: newHp });
            }
            hit = true;
            break;
          }
        }

        if (nlife <= 0 || hit) {
          remove(ref(db, `bullets/${b.id}`));
        } else {
          fbUpdate(ref(db, `bullets/${b.id}`), { x: nx, y: ny, life: nlife });
        }
      });

      // Sincronizar posición propia
      if (now - lastSync > SYNC_INTERVAL) {
        fbUpdate(ref(db, `players/${state.playerId}`), {
          x: player.x,
          y: player.y,
          angle: player.angle,
        });
        lastSync = now;
      }
    }

    // --- Dibuja una barra de vida arriba de un tanque ---
    function drawHealthBar(x, y, hp, maxHp) {
      const barWidth = 50;
      const barHeight = 6;
      const pct = Math.max(0, hp / maxHp);
      const barX = x - barWidth / 2;
      const barY = y - PLAYER_RADIUS - 26;

      // Fondo
      ctx.fillStyle = "#333333";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Relleno según vida
      let fillColor = "#4caf50";
      if (pct < 0.6) fillColor = "#f0d018";
      if (pct < 0.3) fillColor = "#e8392e";

      ctx.fillStyle = fillColor;
      ctx.fillRect(barX, barY, barWidth * pct, barHeight);

      // Borde
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    function draw() {
      const { player, shapes, otherPlayers, remoteBullets } = state;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // --- Dibujado del mundo completo ---
      ctx.fillStyle = "#cdcdcd";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
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

      ctx.save();
      ctx.translate(centerX - player.x, centerY - player.y);

      // Shapes
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
      remoteBullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });
      //Info de daño
      remoteBullets.forEach((b) => {
        if (b.damage) {
          ctx.fillStyle = "#ff0000";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`-${b.damage}`, b.x, b.y - BULLET_RADIUS - 4);
        }
      });

      // Otros jugadores
      Object.values(otherPlayers).forEach((p) => {
        const playerColor = p.color || "#e8392e";
        const pHp = p.hp ?? MAX_HP;

        if (pHp <= 0) return; // no dibujar jugadores muertos

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.fillStyle = "#888888";
        ctx.fillRect(0, -6, 35, 12);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = playerColor;
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.nombre || "Jugador", p.x, p.y - PLAYER_RADIUS - 32);

        drawHealthBar(p.x, p.y, pHp, MAX_HP);
      });

      // Jugador local (solo si está vivo)
      if (player.alive) {
        // Cañón
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.fillStyle = "#888888";
        ctx.fillRect(0, -6, 35, 12);
        ctx.restore();

        // Cuerpo
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Nombre
        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(usuario, player.x, player.y - PLAYER_RADIUS - 32);

        // Barra de vida propia
        drawHealthBar(player.x, player.y, player.hp, MAX_HP);
      }

      ctx.restore();

      // --- HUD (fijo en pantalla, no se traslada con la cámara) ---
      const hudX = 20;
      const hudY = canvas.height - 40;

      if (player.alive) {
        // Barra de vida grande en HUD
        const hudBarWidth = 200;
        const hudBarHeight = 20;
        const pct = Math.max(0, player.hp / MAX_HP);

        ctx.fillStyle = "#333333";
        ctx.fillRect(hudX, hudY, hudBarWidth, hudBarHeight);

        let fillColor = "#4caf50";
        if (pct < 0.6) fillColor = "#f0d018";
        if (pct < 0.3) fillColor = "#e8392e";

        ctx.fillStyle = fillColor;
        ctx.fillRect(hudX, hudY, hudBarWidth * pct, hudBarHeight);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(hudX, hudY, hudBarWidth, hudBarHeight);

        ctx.fillStyle = "#000";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`HP: ${player.hp} / ${MAX_HP}`, hudX, hudY - 8);
      } else {
        // Mensaje de respawn
        const remaining = Math.max(0, Math.ceil((player.respawnAt - performance.now()) / 1000));
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Has sido destruido", canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = "20px sans-serif";
        ctx.fillText(`Reapareciendo en ${remaining}s...`, canvas.width / 2, canvas.height / 2 + 20);
      }
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
      unsubscribePlayers();
      unsubscribeShapes();
      unsubscribeBullets();
      remove(ref(db, `players/${state.playerId}`));
    };
  }, [usuario, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", background: "#cdcdcd" }}
    />
  );
}