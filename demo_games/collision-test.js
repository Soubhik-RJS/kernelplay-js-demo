import {
    Game, Scene, Entity,
    TransformComponent,
    BoxRenderComponent,
    ShapeRenderer,
    CameraComponent,
    ScriptComponent,
    Rigidbody2DComponent,
    ColliderComponent,
    Keyboard, KeyCode,
    UIText, UIPanel, UIProgressBar, UIButton
} from "kernelplay-js";

// ─── Constants ────────────────────────────────────────────────────────────────

const W = window.innerWidth;
const H = window.innerHeight;

const GROUND_Y = H - 40;
const GROUND_H = 40;
const WALL_W = 20;
const PLAYER_SPEED = 260;
const JUMP_VEL = -520;
const BOUNCE_COUNT = 4;

// ─── Player Script ────────────────────────────────────────────────────────────

class PlayerScript extends ScriptComponent {
    onStart() {
        this.transform = this.entity.getComponent("transform");
        this.rb = this.entity.getComponent("rigidbody2d");
        this.grounded = false;
        this.hitCount = 0;
        this.lastHit = null;


    }

    start() {
        super.start();

        // HUD — score label
        this.scoreLabel = this.game.ui.add(new UIText({
            text: "Hits: 0",
            anchor: "topLeft",
            offset: { x: 20, y: 20 },
            style: { fontSize: 16, fontWeight: "bold", textColor: "#e8e8ec" },
        }));

        // HUD — controls hint
        this.hintLabel = this.game.ui.add(new UIText({
            text: "A / D  move     W / Space  jump     R  reset",
            anchor: "topCenter",
            offset: { x: 0, y: 18 },
            style: { fontSize: 11, textColor: "#3a3a52" },
        }));

        // HUD — last hit label
        this.hitLabel = this.game.ui.add(new UIText({
            text: "",
            anchor: "topLeft",
            offset: { x: 20, y: 44 },
            style: { fontSize: 11, textColor: "#9898ff" },
        }));
    }

    onCollision(other) {
        const tag = other.name ?? "unknown";
        if (tag === "Ground" || tag === "WallLeft" || tag === "WallRight") return;

        this.hitCount++;
        this.lastHit = tag;
        this.scoreLabel.text = `Hits: ${this.hitCount}`;
        this.hitLabel.text = `Last: ${tag}`;
    }

    update(dt) {
        // Keyboard movement
        if (Keyboard.isPressed(KeyCode.A) || Keyboard.isPressed(KeyCode.ArrowLeft)) {
            this.rb.velocity.x = -PLAYER_SPEED;
        } else if (Keyboard.isPressed(KeyCode.D) || Keyboard.isPressed(KeyCode.ArrowRight)) {
            this.rb.velocity.x = PLAYER_SPEED;
        } else {
            this.rb.velocity.x *= 0.75; // friction
        }

        // Jump — only when grounded (velocity.y ~= 0 and near ground)
        // const nearGround = this.transform.position.y >= GROUND_Y - 60;
        // if (nearGround && Math.abs(this.rb.velocity.y) < 20) {
        //   this.grounded = true;
        // }

        // if (this.grounded && (Keyboard.wasPressed(KeyCode.W) || Keyboard.wasPressed(KeyCode.Space))) {
        //   this.rb.velocity.y = JUMP_VEL;
        //   this.grounded = false;
        // }

        if (this.rb.isGrounded && (Keyboard.wasPressed(KeyCode.W) || Keyboard.wasPressed(KeyCode.Space))) {
            // this.rb.velocity.y = JUMP_VEL;
            this.rb.addForce(0, -600, "impulse");
        }

        // Reset
        if (Keyboard.wasPressed(KeyCode.R)) {
            this.transform.position.x = W / 2;
            this.transform.position.y = GROUND_Y - 80;
            this.rb.velocity.x = 0;
            this.rb.velocity.y = 0;
            this.hitCount = 0;
            this.lastHit = null;
            this.scoreLabel.text = "Hits: 0";
            this.hitLabel.text = "";
        }
    }
}

// ─── Bouncer Script ───────────────────────────────────────────────────────────

class BouncerScript extends ScriptComponent {
    onStart() {
        this.rb = this.entity.getComponent("rigidbody2d");
        this.transform = this.entity.getComponent("transform");
        // this.color     = this.props.color ?? "#e63946";
        this.renderer = this.entity.getComponent("renderer");

        // Random initial velocity
        const angle = (Math.random() * Math.PI * 0.5) + Math.PI * 0.25;
        const speed = 180 + Math.random() * 120;
        this.rb.velocity.x = (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle) * speed;
        this.rb.velocity.y = -Math.abs(Math.sin(angle)) * speed;
    }

    onCollision(other) {
        // Flip velocity on wall/ground hits for a bouncy feel
        const name = other.name ?? "";
        if (name === "WallLeft" || name === "WallRight") {
            this.rb.velocity.x *= -0.9;
        }
        if (name === "Ground") {
            this.rb.velocity.y *= -0.85;
            this.rb.velocity.x *= 0.97;
        }
    }

    update(dt) {
        // Keep bouncers from sleeping — give a nudge if too slow
        const speed = Math.sqrt(
            this.rb.velocity.x * this.rb.velocity.x +
            this.rb.velocity.y * this.rb.velocity.y
        );
        if (speed < 60) {
            this.rb.velocity.x += (Math.random() - 0.5) * 80;
            this.rb.velocity.y -= 40;
        }

        // Clamp horizontal so they don't escape
        this.rb.velocity.x = Math.max(-400, Math.min(400, this.rb.velocity.x));
    }
}

// ─── Platform Script (visual pulse on player touch) ───────────────────────────

class PlatformScript extends ScriptComponent {
    onStart() {
        this.renderer = this.entity.getComponent("renderer");
        // this.baseColor = this.props.color ?? "#2a2a4a";
        this.flashTime = 0;
    }

    onCollision(other) {
        if (other.name === "Player") {
            this.flashTime = 0.18;
        }
    }

    update(dt) {
        if (this.flashTime > 0) {
            this.flashTime -= dt;
        }
    }
}

// ─── Scene ────────────────────────────────────────────────────────────────────

class CollisionScene extends Scene {
    init() {
        // Camera
        const cam = new Entity("Camera");
        cam.addComponent("transform", new TransformComponent({ position: { x: W / 2, y: H / 2, z: 0 } }));
        cam.addComponent("camera", new CameraComponent({ width: W, height: H, isPrimary: true }));
        this.addEntity(cam);

        // Player
        const player = new Entity("Player");
        player.addComponent("transform", new TransformComponent({ position: { x: W / 2, y: GROUND_Y - 80 } }));
        player.addComponent("renderer", new BoxRenderComponent({ color: "#6c6cff", width: 32, height: 32 }));
        player.addComponent("rigidbody2d", new Rigidbody2DComponent({ useGravity: true, mass: 1, drag: 0.02 }));
        player.addComponent("collider", new ColliderComponent());
        player.addComponent("script", new PlayerScript());
        this.addEntity(player);

        // Bouncing boxes
        const bouncerColors = ["#e63946", "#f4a261", "#2a9d8f", "#e9c46a", "#ff6b9d"];
        for (let i = 0; i < BOUNCE_COUNT; i++) {
            const bx = W * 0.2 + (i / BOUNCE_COUNT) * W * 0.6;
            const by = H * 0.15 + Math.random() * H * 0.15;
            const color = bouncerColors[i % bouncerColors.length];

            const box = new Entity(`Bouncer${i}`);
            box.addComponent("transform", new TransformComponent({ position: { x: bx, y: by } }));
            box.addComponent("renderer", new BoxRenderComponent({ color, width: 28, height: 28 }));
            box.addComponent("rigidbody2d", new Rigidbody2DComponent({ useGravity: true, mass: 0.8, drag: 0.01, restitution: 0.7 }));
            box.addComponent("collider", new ColliderComponent());
            box.addComponent("script", new BouncerScript({ color }));
            this.addEntity(box);
        }

        // Ground
        // this._makeStatic("Ground", W / 2, GROUND_Y + GROUND_H / 2, W, GROUND_H, "#1a1a28");
        this._makeStatic("Ground", W / 2, GROUND_Y + GROUND_H / 2, W, GROUND_H, "#2e2e4a");
        // this._makeStatic("Ground", W / 2, GROUND_Y, W, GROUND_H, "#2e2e4a");

        // Left / right walls
        this._makeStatic("WallLeft", WALL_W / 2, H / 2, WALL_W, H, "#1a1a28");
        this._makeStatic("WallRight", W - WALL_W / 2, H / 2, WALL_W, H, "#1a1a28");

        // Platforms
        const platforms = [
            { x: W * 0.25, y: H * 0.65, w: 160, h: 18, color: "#2a2a4a" },
            { x: W * 0.5, y: H * 0.50, w: 200, h: 18, color: "#2a2a4a" },
            { x: W * 0.75, y: H * 0.65, w: 160, h: 18, color: "#2a2a4a" },
            { x: W * 0.18, y: H * 0.38, w: 120, h: 18, color: "#1e1e3a" },
            { x: W * 0.82, y: H * 0.38, w: 120, h: 18, color: "#1e1e3a" },
            { x: W * 0.5, y: H * 0.28, w: 140, h: 18, color: "#1e1e3a" },
        ];

        platforms.forEach((p, i) => {
            const e = new Entity(`Platform${i}`);
            e.addComponent("transform", new TransformComponent({ position: { x: p.x, y: p.y } }));
            e.addComponent("renderer", new BoxRenderComponent({ color: p.color, width: p.w, height: p.h }));
            e.addComponent("collider", new ColliderComponent());
            e.addComponent("script", new PlatformScript({ color: p.color }));
            this.addEntity(e);
        });


    }

    // Helper — static solid entity (no rigidbody)
    _makeStatic(name, x, y, w, h, color) {
        const e = new Entity(name);
        e.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));
        e.addComponent("renderer", new ShapeRenderer({ color, width: w, height: h }));
        e.addComponent("collider", new ColliderComponent({ width: w, height: h }));
        this.addEntity(e);
    }
}

// ─── Game ─────────────────────────────────────────────────────────────────────

class CollisionGame extends Game {
    init() {
        this.sceneManager.addScene(new CollisionScene("Main"));
        this.sceneManager.startScene("Main");
    }
}

const canvas = document.getElementById("canvas-container");
canvas.width = W;
canvas.height = H;

new CollisionGame({
    width: W,
    height: H,
    fps: 60,
    container: "#canvas-container",
    debugPhysics: true,
}).start();