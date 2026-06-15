import { useRef, useEffect } from "react";
import { db, ref, set, onValue, onDisconnect, remove, fbUpdate, push } from "../firebase";

const PLAYER_SPEED = 4;
const PLAYER_RADIUS = 20;
const BULLET_SPEED = 8;
const BULLET_RADIUS = 5;
const FIRE_COOLDOWN = 250;

export default function Game({ usuario }) {
  const canvasRef = useRef(null);

  const stateRef = useRef({
    player: { x: 0, y: 0, angle: 0, hp: 100 },
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

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    state.player.x = (Math.random() - 0.5) * 1000;
    state.player.y = (Math.random() - 0.5) * 1000;

    // --- Registrar jugador en Firebase ---
    const playersRef = ref(db, "players");
    const newPlayerRef = push(playersRef);
    state.playerId = newPlayerRef.key;

    set(newPlayerRef, {
      nombre: usuario,
      x: state.player.x,
      y: state.player.y,
      angle: 0,
      hp: 100,
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
    let lastSync = 0;
    const SYNC_INTERVAL = 50;

    function update(dt) {
      const { player, keys, mouse, shapes, remoteBullets } = state;

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

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      player.angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

      const now = performance.now();
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

      // Cada cliente gestiona solo las balas que disparó
      remoteBullets.forEach((b) => {
        if (b.owner !== state.playerId) return;

        let nx = b.x + b.vx;
        let ny = b.y + b.vy;
        let nlife = b.life - 1;
        let hit = false;

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

      if (now - lastSync > SYNC_INTERVAL) {
        fbUpdate(ref(db, `players/${state.playerId}`), {
          x: player.x,
          y: player.y,
          angle: player.angle,
        });
        lastSync = now;
      }
    }

    function draw() {
      const { player, shapes, otherPlayers, remoteBullets } = state;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.fillStyle = "#cdcdcd";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      ctx.fillStyle = "#9aa7d1";
      remoteBullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      Object.values(otherPlayers).forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.fillStyle = "#888888";
        ctx.fillRect(0, -6, 35, 12);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#e8392e";
        ctx.fill();
        ctx.strokeStyle = "#a8231e";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.nombre || "Jugador", p.x, p.y - PLAYER_RADIUS - 8);
      });

      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = "#888888";
      ctx.fillRect(0, -6, 35, 12);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#00b2e1";
      ctx.fill();
      ctx.strokeStyle = "#0089b3";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(usuario, player.x, player.y - PLAYER_RADIUS - 8);

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
      unsubscribePlayers();
      unsubscribeShapes();
      unsubscribeBullets();
      remove(ref(db, `players/${state.playerId}`));
    };
  }, [usuario]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", background: "#cdcdcd" }}
    />
  );
}