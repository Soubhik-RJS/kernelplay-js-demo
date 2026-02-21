// ─── EXAMPLES.JS ──────────────────────────────────────────────────────────────
// Self-contained canvas demo runner with tab switching logic.
// No external dependencies needed.

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");

let currentDemo = null;
let animFrame = null;
let lastTime = 0;

// ── Utility ───────────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function stopDemo() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  if (currentDemo && currentDemo.destroy) currentDemo.destroy();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loop(demo) {
  currentDemo = demo;
  lastTime = performance.now();
  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    demo.update(dt);
    demo.draw(ctx);
    animFrame = requestAnimationFrame(tick);
  }
  animFrame = requestAnimationFrame(tick);
}

// ── Tab switching ─────────────────────────────────────────────────────────────
const TABS = ["bouncing", "platformer", "particles", "triggers", "gravity"];

function switchTab(id) {
  stopDemo();
  // Update tab UI
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === id);
  });
  // Update code panel
  document.querySelectorAll(".code-panel").forEach(p => {
    p.style.display = p.id === "code-" + id ? "block" : "none";
  });
  // Launch demo
  switch (id) {
    case "bouncing":   loop(new BouncingDemo()); break;
    case "platformer": loop(new PlatformerDemo()); break;
    case "particles":  loop(new ParticlesDemo()); break;
    case "triggers":   loop(new TriggersDemo()); break;
    case "gravity":    loop(new GravityDemo()); break;
  }
}

// ── DEMO 1: Bouncing Balls ─────────────────────────────────────────────────────
class BouncingDemo {
  constructor() {
    this.balls = Array.from({ length: 18 }, (_, i) => ({
      x: rand(40, canvas.width - 40),
      y: rand(40, canvas.height - 40),
      r: rand(14, 32),
      vx: rand(-200, 200),
      vy: rand(-200, 200),
      color: `hsl(${rand(0, 360)}, 70%, 60%)`,
    }));
  }
  update(dt) {
    const W = canvas.width, H = canvas.height;
    for (const b of this.balls) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x - b.r < 0)  { b.x = b.r;     b.vx *= -1; }
      if (b.x + b.r > W)  { b.x = W - b.r; b.vx *= -1; }
      if (b.y - b.r < 0)  { b.y = b.r;     b.vy *= -1; }
      if (b.y + b.r > H)  { b.y = H - b.r; b.vy *= -1; }
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const b of this.balls) {
      const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .1, b.x, b.y, b.r);
      g.addColorStop(0, "white");
      g.addColorStop(.3, b.color);
      g.addColorStop(1, "rgba(0,0,0,.5)");
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }
}

// ── DEMO 2: Platformer ────────────────────────────────────────────────────────
class PlatformerDemo {
  constructor() {
    this.keys = {};
    this._kd = e => { this.keys[e.key] = true; };
    this._ku = e => { this.keys[e.key] = false; };
    window.addEventListener("keydown", this._kd);
    window.addEventListener("keyup", this._ku);

    this.player = { x: 80, y: 100, w: 28, h: 36, vx: 0, vy: 0, grounded: false, color: "#6366f1" };
    this.platforms = [
      { x: 0,   y: 320, w: 800, h: 20 },
      { x: 100, y: 240, w: 120, h: 14 },
      { x: 300, y: 190, w: 100, h: 14 },
      { x: 480, y: 150, w: 130, h: 14 },
      { x: 640, y: 220, w: 110, h: 14 },
      { x: 220, y: 280, w: 80,  h: 14 },
    ];
    this.coins = [
      { x: 145, y: 215, collected: false },
      { x: 335, y: 165, collected: false },
      { x: 525, y: 125, collected: false },
      { x: 680, y: 195, collected: false },
    ];
    this.score = 0;
    this.t = 0;
  }
  destroy() {
    window.removeEventListener("keydown", this._kd);
    window.removeEventListener("keyup", this._ku);
  }
  update(dt) {
    this.t += dt;
    const p = this.player;
    const speed = 220, jump = -480, gravity = 900;

    // Input
    if (this.keys["ArrowLeft"]  || this.keys["a"]) p.vx = -speed;
    else if (this.keys["ArrowRight"] || this.keys["d"]) p.vx = speed;
    else p.vx *= 0.75;

    if ((this.keys["ArrowUp"] || this.keys["w"] || this.keys[" "]) && p.grounded) {
      p.vy = jump;
      p.grounded = false;
    }

    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.grounded = false;

    // Collide with platforms
    for (const pl of this.platforms) {
      if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h > pl.y && p.y < pl.y + pl.h) {
        if (p.vy > 0 && p.y + p.h - p.vy * dt <= pl.y + 4) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.grounded = true;
        }
      }
    }

    // Wrap
    if (p.x < -p.w) p.x = canvas.width;
    if (p.x > canvas.width) p.x = -p.w;
    if (p.y > canvas.height + 60) { p.y = 0; p.vy = 0; }

    // Coins
    for (const c of this.coins) {
      if (!c.collected && Math.abs(p.x + p.w/2 - c.x) < 18 && Math.abs(p.y + p.h/2 - c.y) < 18) {
        c.collected = true;
        this.score += 10;
      }
    }
  }
  draw(ctx) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#1e1b4b");
    sky.addColorStop(1, "#312e81");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,.6)";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 17) % canvas.width);
      const sy = ((i * 73 + 31) % (canvas.height * .7));
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Platforms
    for (const pl of this.platforms) {
      ctx.fillStyle = "#4f46e5";
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
      ctx.fillStyle = "#6366f1";
      ctx.fillRect(pl.x, pl.y, pl.w, 4);
    }

    // Coins
    for (const c of this.coins) {
      if (c.collected) continue;
      const pulse = Math.sin(this.t * 4 + c.x) * 2;
      ctx.beginPath();
      ctx.arc(c.x, c.y + pulse, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Player
    const p = this.player;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 6);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "white";
    ctx.fillRect(p.x + 6, p.y + 8, 5, 5);
    ctx.fillRect(p.x + 17, p.y + 8, 5, 5);
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(p.x + 8, p.y + 9, 3, 3);
    ctx.fillRect(p.x + 19, p.y + 9, 3, 3);

    // Score & HUD
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect(12, 12, 150, 36);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`Score: ${this.score}`, 22, 36);

    // Controls hint
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "12px monospace";
    ctx.fillText("← → to move  |  ↑ / Space to jump", 10, canvas.height - 12);
  }
}

// ── DEMO 3: Particle System ───────────────────────────────────────────────────
class ParticlesDemo {
  constructor() {
    this.particles = [];
    this.emitters = [
      { x: canvas.width * .25, y: canvas.height * .6, color: [99,102,241], active: true },
      { x: canvas.width * .75, y: canvas.height * .6, color: [236,72,153], active: true },
      { x: canvas.width * .5,  y: canvas.height * .4, color: [251,191,36], active: true },
    ];
    this.t = 0;
    this._mm = e => {
      const rect = canvas.getBoundingClientRect();
      this.mx = e.clientX - rect.left;
      this.my = e.clientY - rect.top;
      this.mouseActive = true;
    };
    this._ml = () => { this.mouseActive = false; };
    canvas.addEventListener("mousemove", this._mm);
    canvas.addEventListener("mouseleave", this._ml);
    this.mx = canvas.width / 2; this.my = canvas.height / 2;
    this.mouseActive = false;
  }
  destroy() {
    canvas.removeEventListener("mousemove", this._mm);
    canvas.removeEventListener("mouseleave", this._ml);
  }
  emit(x, y, color, count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(40, 180);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(30, 80),
        life: 1,
        maxLife: rand(0.6, 1.4),
        r: rand(2, 7),
        color: `rgba(${color[0]},${color[1]},${color[2]}`,
      });
    }
  }
  update(dt) {
    this.t += dt;
    for (const em of this.emitters) {
      em.x = canvas.width * (.5 + Math.cos(this.t * .8 + this.emitters.indexOf(em) * 2.1) * .3);
      this.emit(em.x, em.y, em.color, 4);
    }
    if (this.mouseActive) {
      this.emit(this.mx, this.my, [255, 255, 255], 6);
    }
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt / p.maxLife;
    }
    this.particles = this.particles.filter(p => p.life > 0 && p.y < canvas.height + 20);
  }
  draw(ctx) {
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const p of this.particles) {
      const alpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color},${alpha})`;
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.font = "12px monospace";
    ctx.fillText(`Particles: ${this.particles.length}  |  Move mouse over canvas`, 10, canvas.height - 12);
  }
}

// ── DEMO 4: Trigger Zones ─────────────────────────────────────────────────────
class TriggersDemo {
  constructor() {
    this.player = { x: 60, y: 160, w: 28, h: 28, vx: 90, vy: 0, color: "#6366f1" };
    this.zones = [
      { x: 150, y: 100, w: 120, h: 100, color: "#22c55e", label: "Heal Zone", active: false, effect: "health" },
      { x: 380, y: 130, w: 110, h: 90,  color: "#ef4444", label: "Damage Zone", active: false, effect: "damage" },
      { x: 600, y: 100, w: 130, h: 110, color: "#f59e0b", label: "Speed Zone", active: false, effect: "speed" },
    ];
    this.log = [];
    this.health = 80;
    this.speed = 90;
    this.t = 0;
  }
  update(dt) {
    this.t += dt;
    const p = this.player;
    p.x += p.vx * dt;
    p.y += Math.sin(this.t * 2) * 30 * dt;
    p.y = clamp(p.y, 60, canvas.height - 80);

    if (p.x > canvas.width + 40) { p.x = -40; }

    for (const z of this.zones) {
      const inside = p.x + p.w > z.x && p.x < z.x + z.w &&
                     p.y + p.h > z.y && p.y < z.y + z.h;
      if (inside && !z.active) {
        z.active = true;
        this.log.unshift(`onTriggerEnter: ${z.label}`);
        if (this.log.length > 4) this.log.pop();
        if (z.effect === "health") this.health = Math.min(100, this.health + 15);
        if (z.effect === "damage") this.health = Math.max(0, this.health - 20);
        if (z.effect === "speed")  { p.vx = 190; setTimeout(() => p.vx = 90, 1500); }
      } else if (!inside) {
        if (z.active) { this.log.unshift(`onTriggerExit: ${z.label}`); if (this.log.length > 4) this.log.pop(); }
        z.active = false;
      }
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const z of this.zones) {
      const alpha = z.active ? 0.35 : 0.12;
      ctx.fillStyle = z.color + Math.round(alpha * 255).toString(16).padStart(2,"0");
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = z.color;
      ctx.lineWidth = z.active ? 2.5 : 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(z.x, z.y, z.w, z.h);
      ctx.setLineDash([]);
      ctx.fillStyle = z.color;
      ctx.font = "bold 11px monospace";
      ctx.fillText(z.label, z.x + 8, z.y + 18);
    }

    // Player
    const p = this.player;
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 6);
    ctx.fill();

    // Health bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(12, 14, 160, 18);
    ctx.fillStyle = this.health > 50 ? "#22c55e" : this.health > 25 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(12, 14, this.health * 1.6, 18);
    ctx.fillStyle = "white";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`HP: ${this.health}`, 18, 27);

    // Event log
    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillRect(10, canvas.height - 90, 370, 80);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText("Event Log:", 18, canvas.height - 76);
    this.log.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? "#86efac" : "#64748b";
      ctx.fillText(line, 18, canvas.height - 60 + i * 14);
    });
  }
}

// ── DEMO 5: Gravity Sandbox ───────────────────────────────────────────────────
class GravityDemo {
  constructor() {
    this.bodies = [
      { x: canvas.width/2, y: canvas.height/2, mass: 6000, r: 22, fixed: true, color: "#fbbf24", vx:0, vy:0 },
    ];
    this.G = 6000;
    this._mc = e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const angle = rand(0, Math.PI * 2);
      const dist = rand(80, 200);
      const cx = canvas.width/2, cy = canvas.height/2;
      const dx = mx - cx, dy = my - cy;
      const d = Math.sqrt(dx*dx+dy*dy) || 1;
      const orbitSpeed = Math.sqrt(this.G * 6000 / d) * .85;
      this.bodies.push({
        x: mx, y: my, mass: rand(50,300),
        r: rand(4, 10),
        vx: -(dy/d) * orbitSpeed,
        vy:  (dx/d) * orbitSpeed,
        fixed: false,
        color: `hsl(${rand(0,360)},70%,60%)`
      });
    };
    canvas.addEventListener("click", this._mc);
    this.t = 0;
    // Pre-spawn some orbiters
    for (let i = 0; i < 6; i++) this._mc({
      clientX: canvas.getBoundingClientRect().left + canvas.width/2 + rand(-200,200),
      clientY: canvas.getBoundingClientRect().top  + canvas.height/2 + rand(-140,140),
    });
  }
  destroy() { canvas.removeEventListener("click", this._mc); }
  update(dt) {
    this.t += dt;
    const W = canvas.width, H = canvas.height;
    for (const a of this.bodies) {
      if (a.fixed) continue;
      let ax = 0, ay = 0;
      for (const b of this.bodies) {
        if (a === b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist2 = dx*dx + dy*dy;
        const dist = Math.sqrt(dist2) + 0.1;
        const f = this.G * b.mass / dist2;
        ax += (dx / dist) * f;
        ay += (dy / dist) * f;
      }
      a.vx += ax * dt;
      a.vy += ay * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
    }
    this.bodies = this.bodies.filter(b => b.fixed || (b.x > -300 && b.x < W+300 && b.y > -300 && b.y < H+300));
  }
  draw(ctx) {
    ctx.fillStyle = "#03040f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Stars
    ctx.fillStyle = "rgba(255,255,255,.4)";
    for (let i = 0; i < 80; i++) {
      ctx.fillRect((i*211+7)%canvas.width, (i*97+19)%canvas.height, 1.5, 1.5);
    }
    for (const b of this.bodies) {
      if (b.fixed) {
        // Glow
        const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 4);
        glow.addColorStop(0, "rgba(251,191,36,.5)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.font = "12px monospace";
    ctx.fillText(`Bodies: ${this.bodies.length}  |  Click to add orbiting body`, 10, canvas.height - 12);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  switchTab("bouncing");
});
