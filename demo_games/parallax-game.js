import {Entity, Game, ref, Scene } from "kernelplay-js";
import {
    TransformComponent,
    CameraComponent,
    Rigidbody2DComponent,
    ScriptComponent,
    ColliderComponent,
    AudioListener,
    AudioSource
} from "kernelplay-js";
import { Keyboard, KeyCode } from "kernelplay-js";
import { PixiShapeRenderer } from "@kernelplay/pixi-renderer";
import { PixiRenderer, PixiSpriteComponent } from "@kernelplay/pixi-renderer";
import { AnimatorComponent, AnimatorController, AnimationClip } from "kernelplay-js";
import { Mathf } from "kernelplay-js";
import * as PIXI from "pixi.js";

function PlayerAnimatorController() {
    const idleClip = new AnimationClip({
        name: "idle",
        frames: [0, 2],
        frameRate: 2,
        loop: true,
        gridWidth: 4,
        frameWidth: 64,
        frameHeight: 64,
    });

    const walkClip = new AnimationClip({
        name: "walk",
        frames: [8, 9, 10, 11],
        frameRate: 6,
        loop: true,
        gridWidth: 4,
        frameWidth: 64,
        frameHeight: 64,
    });

    const jumpClip = new AnimationClip({
        name: "jump",
        frames: [9],
        frameRate: 1,
        loop: true,
        gridWidth: 4,
        frameWidth: 64,
        frameHeight: 64,
    });

    return new AnimatorController()
        .addParameter("speed", "float", 0)
        .addParameter("isGrounded", "bool", false)
        .addParameter("jump", "trigger")

        .addState("idle", idleClip)
        .addState("walk", walkClip)
        .addState("jump", jumpClip)

        // idle → walk: must be moving AND grounded
        .addTransition("idle", "walk", {
            conditions: [
                { param: "speed", op: ">", value: 0.1 },
                { param: "isGrounded", op: "true" },   // ← grounded check
            ],
            hasExitTime: false,
            duration: 0,
        })

        // walk → idle: stopped OR not grounded
        .addTransition("walk", "idle", {
            conditions: [
                { param: "speed", op: "<=", value: 0.1 },
            ],
            hasExitTime: false,
            duration: 0,
        })

        // walk → jump if leaves ground (e.g. walks off a ledge)
        .addTransition("walk", "jump", {
            conditions: [
                { param: "isGrounded", op: "false" },  // ← fell off ledge
            ],
            hasExitTime: false,
            duration: 0,
        })

        // AnyState → jump on trigger
        .addAnyStateTransition("jump", {
            conditions: [{ param: "jump", op: "trigger" }],
            hasExitTime: false,
            priority: 10,
        })

        // jump → idle only when grounded again
        .addTransition("jump", "idle", {
            conditions: [
                { param: "isGrounded", op: "true" },   // ← wait for landing
            ],
            hasExitTime: false,
            duration: 0,
        });

}

// Helper function to generate the soft light texture once
let cachedGlowTexture = null;
function getGlowTexture() {
    if (cachedGlowTexture) return cachedGlowTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Assuming PixiJS is imported globally or available in your scope
    cachedGlowTexture = PIXI.Texture.from(canvas);
    return cachedGlowTexture;
}

class Camera extends Entity {
    constructor(game, x = 400, y = 300) {
        super("Camera");
        this.tag = "Camera";
        // this.zIndex = 10;

        this.addComponent("transform", new TransformComponent({ position: { x, y } }));
        this.addComponent("audioListener", new AudioListener());
        this.addComponent("camera", new CameraComponent({
            width: game.config.width,
            height: game.config.height,
            isPrimary: true,
            bounds: {
                minX: -2084,
                maxX: 2500,
                minY: 0,
                maxY: 600
            },
        }));
    }
}

class Ground extends Entity {
    constructor(x = 400, y = 300) {
        super("Ground");
        this.tag = "Ground";

        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));
        this.addComponent("collider", new ColliderComponent({ width: 5000, height: 50, }));
    }
}

// class NightOverlay extends Entity {
//     constructor(game) {
//         super("NightOverlay");
//         this.tag = "NightOverlay";
//         this.zIndex = 99;

//         this.addComponent("transform", new TransformComponent({
//             position: { x: game.config.width / 2, y: game.config.height / 2 },
//         }));
//         this.addComponent("renderer", new PixiShapeRenderer({
//             shape: "rect",
//             width: game.config.width,
//             height: game.config.height,
//             color: 0x0a0a2a,
//             alpha: 0.85,
//         }));
//     }
// }

class LightingSystem extends Entity {
    constructor(game, cameraEntity) {
        super("LightingSystem");
        this.tag = "LightingSystem";
        this.zIndex = 99;
        this.game = game;
        this.cameraEntity = cameraEntity;
    }

    _start() {
        const app = this.scene?.game?.renderer?.app;
        if (!app) return;

        // this.width = app.screen.width;
        this.height = app.screen.height;
        this.width = 5000;

        // 1. Create the Render Texture
        this.lightmapTexture = PIXI.RenderTexture.create({
            width: this.width,
            height: this.height
        });

        // 2. Create the Sprite that displays the lightmap over your game
        this.lightmapSprite = new PIXI.Sprite(this.lightmapTexture);
        this.lightmapSprite.zIndex = 99;
        this.lightmapSprite.blendMode = 'multiply';

        app.stage.addChild(this.lightmapSprite);
        app.stage.sortableChildren = true;

        // 3. Create a Container where we will group the darkness and lights together
        this.lightContainer = new PIXI.Container();

        // 4. Draw the base darkness
        this.darkness = new PIXI.Graphics();
        this.darkness.rect(0, 0, this.width, this.height).fill(0x0a0a2a);
        this.darkness.alpha = 0.70;

        this.lightContainer.addChild(this.darkness);
    }

    addLightSprite(sprite) {
        if (this.lightContainer) {
            this.lightContainer.addChild(sprite);
        }
    }

    update(dt) {
        super.update?.(dt);
        const app = this.scene?.game?.renderer?.app;

        if (app && this.lightmapTexture && this.lightContainer && this.cameraEntity) {

            // Get the camera's Transform component (Fix: changed "camera" to "transform")
            const cameraTransform = this.cameraEntity.getComponent("transform");
            if (!cameraTransform) return;

            const cameraX = cameraTransform.position.x;
            const cameraY = cameraTransform.position.y;

            // Calculate the top-left corner of the camera's view
            const screenLeft = cameraX - (this.width / 2);
            const screenTop = cameraY - (this.height / 2);

            // --- THE CAMERA LOCKING MATH ---

            // 1. Glue the Lightmap Screen to the camera so it covers the monitor
            this.lightmapSprite.x = screenLeft;
            this.lightmapSprite.y = screenTop;

            // 2. Glue the Darkness graphic to the camera so it doesn't get left behind
            this.darkness.x = screenLeft;
            this.darkness.y = screenTop;

            // 3. Shift the container in reverse! 
            // Because the camera moved right, we shift the container left. 
            // This perfectly aligns the world-coordinate FireLights onto the texture.
            this.lightContainer.x = -screenLeft;
            this.lightContainer.y = -screenTop;

            // -------------------------------

            // Re-render the lightmap every single frame
            app.renderer.render({
                container: this.lightContainer,
                target: this.lightmapTexture,
                clear: true
            });

            // Keep your ECS Transform updated just in case other systems need it
            const myTransform = this.getComponent("transform");
            if (myTransform) {
                myTransform.position.x = cameraX;
                myTransform.position.y = cameraY;
            }
        }
    }
}

class PointLight extends Entity {
    // Add options to customize the color, size, and if it flickers
    constructor(x, y, lightingSystem, options = {}) {
        super("PointLight");
        this.tag = "Light";
        this.lightingSystem = lightingSystem;
        this.time = 0;

        // Setup configuration defaults
        this.lightColor = options.color || 0xffffff;
        this.lightScale = options.scale || 1.0;
        this.flicker = options.flicker || false;

        this.addComponent("transform", new TransformComponent({
            position: { x: x, y: y },
            scale: { x: 1, y: 1 }
        }));
    }

    _start() {
        this.sprite = new PIXI.Sprite(getGlowTexture());
        this.sprite.anchor.set(0.5);
        this.sprite.blendMode = 'add';

        // Apply our custom color and scale
        this.sprite.tint = this.lightColor;
        this.sprite.scale.set(this.lightScale);

        if (this.lightingSystem) {
            this.lightingSystem.addLightSprite(this.sprite);
        }
    }

    update(dt) {
        super.update?.(dt);

        const transform = this.getComponent("transform");
        if (transform) {
            this.sprite.x = transform.position.x;
            this.sprite.y = transform.position.y;
        }

        // Only run the complex math if this is a flickering light (like fire)
        if (this.flicker) {
            this.time += dt * 0.1;
            this.sprite.alpha = 0.7 + Math.random() * 0.3;
            const scaleWobble = (Math.sin(this.time) * 0.05) + (Math.random() * 0.03);
            this.sprite.scale.set(this.lightScale + scaleWobble);
        } else {
            // Keep steady lights at full opacity
            this.sprite.alpha = 1.0;
        }
    }
}

class Player extends Entity {
    constructor(x = 400, y = 300) {
        super("Player");
        this.tag = "Player";
        this.zIndex = 10;

        this.addComponent("transform", new TransformComponent({
            position: { x, y }
        }));
        this.addComponent("rigidbody2d", new Rigidbody2DComponent({
            mass: 1,
            gravityScale: 1,
            drag: 1,
        }));

        this.addComponent("collider", new ColliderComponent({ height: 70 }));
        this.addComponent("renderer", new PixiSpriteComponent({
            image: "./assets/player_sheet.png",
            sourceWidth: 64,
            sourceHeight: 64,
            width: 70,
            height: 70,
            anchor: { x: 0.5, y: 0.5 },
            zIndex: 10,
        }));

        this.addComponent("animator", new AnimatorComponent({ controller: PlayerAnimatorController() }));
        this.addComponent("audio", new AudioSource({
            clips: {
                run: './assets/run.mp3',
                jump: './assets/jump.mp3',
            },
            volume: 1.0,
        }));
        this.addComponent('script', new PlayerScript({
            speed: 200,
        }))
    }
}

class PlayerScript extends ScriptComponent {
    onStart() {
        this.animator = this.entity.getComponent("animator");
        this.sprite = this.entity.getComponent("renderer");
        this.rb = this.entity.getComponent("rigidbody2d");
        this.transform = this.entity.getComponent("transform");
        this.audio = this.entity.getComponent("audio");

        this._isRunningSoundPlaying = false;
        this._isJumping = false;
        this.isLose = false;
    }

    start() {
        super.start();
        this.camera.setTarget(this.entity);
    }

    update(dt) {
        this.rb.velocity.x = 0;

        if (Keyboard.isPressed(KeyCode.ArrowRight)) {
            this.rb.velocity.x = this.speed;
            this.sprite.flipX = false;
        }
        if (Keyboard.isPressed(KeyCode.ArrowLeft)) {
            this.rb.velocity.x = -this.speed;
            this.sprite.flipX = true;
        }

        const isMoving = this.rb.velocity.x !== 0;
        this.animator.setParameter("speed", isMoving ? 1 : 0);
        this.animator.setParameter("isGrounded", this.rb.isGrounded);

        if (this.rb.isGrounded && Keyboard.wasPressed(KeyCode.Space)) {
            this.rb.addForce(0, -600, "impulse");
            this.audio.stopLoop('run');          // cut run sound immediately
            this.audio.playOneShot('jump', { volume: 0.05 });
            this.animator.setTrigger("jump");
        }

        if (isMoving && this.rb.isGrounded) {
            this.audio.playLoop('run', { volume: 0.1 });
        } else {
            this.audio.stopLoop('run');
        }

        if (Keyboard.isPressed(KeyCode.P)){
            console.log(this.transform.position.x);
        }

        this.transform.position.x = Mathf.clamp(this.transform.position.x, -2067, 2485)
    }
}

class BackGround extends Entity {
    constructor(x = 400, y = 300, cameraEntity) {
        super("BackGround");
        this.tag = "BackGround";
        this.zIndex = -11;
        this.cameraEntity = cameraEntity;

        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));
        this.addComponent("renderer", new PixiSpriteComponent({
            image: "./assets/layers/sky.png",
            width: 1000,
            height: 600,
            anchor: { x: 0.5, y: 0.5 },
            zIndex: -11,
        }));
    }

    update(dt) {
        super.update(dt);

        if (this.cameraEntity) {
            const cameraTransform = this.cameraEntity.getComponent("camera");
            if (!cameraTransform) return;
            const Transform = this.getComponent("transform");

            Transform.position.x = cameraTransform.position.x;
            Transform.position.y = cameraTransform.position.y;
        }
    }
}

class ParallaxBackground extends Entity {
    // Pass the camera entity and a parallaxFactor (e.g., 0.2)
    constructor(game, texturePath, cameraEntity, parallaxFactor, zIndex = -10, customHeight = null, yOffset = 0) {
        super("ParallaxBackground");
        this.tag = "Background";
        this.zIndex = zIndex; // Ensure background layers stack properly

        this.game = game;
        this.texturePath = texturePath;
        this.cameraEntity = cameraEntity; // Reference to your game's Camera entity
        this.parallaxFactor = parallaxFactor; // 0 = infinitely far, 1 = foreground

        // Store our new optimization variables
        this.customHeight = customHeight;
        this.yOffset = yOffset;
    }

    _start() {
        const app = this.scene?.game?.renderer?.app;
        if (!app) return;

        const texture = PIXI.Texture.from(this.texturePath);

        // We make it the exact size of the screen because it acts as a window
        this.tilingBg = new PIXI.TilingSprite({
            texture: texture,
            width: app.screen.width,
            height: this.customHeight || app.screen.height
        });

        this.tilingBg.zIndex = this.zIndex;

        // Calculate how much we need to scale the image so it fits the screen height
        // const scaleY = app.screen.height / texture.height;
        const scaleY = (app.screen.height) / texture.height;

        // We apply the same scale to X and Y so the image doesn't look stretched/squished
        this.tilingBg.tileScale.set(scaleY, scaleY);
        // --------------------------------------

        app.stage.addChild(this.tilingBg);
        app.stage.sortableChildren = true;
    }

    update(dt) {
        super.update?.(dt);

        if (this.tilingBg && this.cameraEntity) {
            const cameraTransform = this.cameraEntity.getComponent("camera");
            if (!cameraTransform) return;

            const cameraX = cameraTransform.position.x;
            const cameraY = cameraTransform.position.y;

            // 1. Keep the physical box glued to the camera
            this.tilingBg.x = cameraX - (this.tilingBg.width / 2);
            this.tilingBg.y = (cameraY - (this.tilingBg.height / 2)) + this.yOffset;

            // 2. Parallax the X axis so it scrolls left/right
            this.tilingBg.tilePosition.x = -cameraX * this.parallaxFactor;

            // 3. Keep the Y axis locked so it NEVER scrolls up/down
            // (This guarantees the vertical seam never appears even if you jump!)
            this.tilingBg.tilePosition.y = 0;
        }
    }
}

class Fire extends Entity {
    constructor(x, y, color = "red") {
        super("CampFire");
        this.tag = "CampFire";
        this.zIndex = 9;

        this.addComponent("transform", new TransformComponent({
            position: { x, y }
        }));

        this.addComponent("renderer", new PixiSpriteComponent({
            image: color === "red" ? "./assets/fire.png" : "./assets/blue_fire.png",
            sourceWidth: 64,
            sourceHeight: 120,
            width: 70,
            height: 130,
            anchor: { x: 0.5, y: 0.5 },
            zIndex: 10,
        }));

        this.addComponent("animator", new AnimatorComponent({
            animations: {
                red_fire: {
                    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                    frameRate: 30,
                    loop: true,
                    gridWidth: 8,
                    frameWidth: 64,
                    frameHeight: 128
                },

                blue_fire: {
                    frames: [0, 1, 2, 3, 4, 5, 6, 7],
                    frameRate: 12,
                    loop: true,
                    gridWidth: 4,
                    frameWidth: 127,
                    frameHeight: 255
                },
            },
            defaultAnimation: color === "red" ? "red_fire" : "blue_fire",
        }));

        this.addComponent("audio", new AudioSource({
            clips: {
                ambient: color === "red" ? './assets/red_fire.mp3' : './assets/blue_fire.mp3',
                ambient_2: './assets/red_fire_2.mp3',
                ambient_3: './assets/blue_fire.mp3',
            },
            clip: 'ambient',
            loop: true,
            playOnStart: true,
            volume: 1,
        }));

        // Auto Play at start
        this.addComponent("script", new ScriptComponent({
            onStart() {
                this.audio = this.entity.getComponent("audio");
                this.audio.playLoop('ambient');
            }
        }));
    }
}

class CampFireBase extends Entity {
    constructor(x, y) {
        super("CampFireBase");
        this.tag = "CampFireBase";
        this.zIndex = 8;

        this.addComponent("transform", new TransformComponent({
            position: { x, y }
        }));

        this.addComponent("renderer", new PixiSpriteComponent({
            image: "./assets/campfire_base.png",
            width: 50,
            height: 80,
            anchor: { x: 0.5, y: 0.5 },
            zIndex: 10,
        }));

    }
}

function CampFire(scene, lighting, pos, lightColor, flameColor) {
    scene.addEntity(new PointLight(pos, 510, lighting, {
        color: lightColor,
        scale: 1.0,
        flicker: true
    }));

    scene.addEntity(new Fire(pos, 485, flameColor));
    scene.addEntity(new CampFireBase(pos, 530));
}

class MyScene extends Scene {
    init() {
        const camera = new Camera(this.game)
        this.addEntity(camera);
        this.addEntity(new Player(400, 300));
        this.addEntity(new Ground(400, 580));

        // 1. Create and add the new Lighting System
        const lighting = new LightingSystem(this.game, camera);
        this.addEntity(lighting);

        CampFire(this, lighting, 350, 0xffae44, "red");
        CampFire(this, lighting, 1200, 0x44e9ff, "blue");

        // 2. Bright, steady moon
        this.cameraTransform = camera.getComponent("camera");
        
        let moonLight = new PointLight(535, 105, lighting, {
            color: 0xffffff,
            scale: 1.7,      
            flicker: false   
        });
        this.addEntity(moonLight);
        this.moonLightTransform = moonLight.getComponent("transform");

        this.addEntity(new BackGround(400, 300, camera));

        this.addEntity(new ParallaxBackground(this.game, './assets/layers/clouds_1.png', camera, 0.1, -9, 300, -150));
        this.addEntity(new ParallaxBackground(this.game, './assets/layers/clouds_2.png', camera, 0.3, -9, 340, -130));

        this.addEntity(new ParallaxBackground(this.game, './assets/layers/ground_1.png', camera, 0.4, -8, -400, 100));
        this.addEntity(new ParallaxBackground(this.game, './assets/layers/ground_2.png', camera, 0.7, -8));
        this.addEntity(new ParallaxBackground(this.game, './assets/layers/ground_3.png', camera, 1, -8));

        this.addEntity(new ParallaxBackground(this.game, './assets/layers/rocks.png', camera, 0.1, -10, -380, 120));

        this.game.audio.playBGM('./assets/bg.mp3', { loop: true, fadeDuration: 1.5 });
        game.audio.setBGMVolume(1);
    }

    update(dt){
        super.update(dt);
        this.moonLightTransform.position.x = this.cameraTransform.position.x + 135;
    }
}

const game = new Game({
    renderer: new PixiRenderer(),
    width: 800,
    height: 600,
    fps: 60,
    // debugPhysics: true,
    backgroundColor: "#1a1a1a"
});

await PIXI.Assets.load([
    "./assets/player_sheet.png",
    "./assets/bg.jpg",
    "./assets/layers/sky.png",
    "./assets/layers/moon.png",
    "./assets/layers/clouds_1.png",
    "./assets/layers/clouds_2.png",
    "./assets/layers/ground_1.png",
    "./assets/layers/ground_2.png",
    "./assets/layers/ground_3.png",
    "./assets/layers/plant.png",
    "./assets/layers/rocks.png",
    "./assets/fire.png",
    "./assets/blue_fire.png",
    "./assets/campfire_base.png",
]);

await game.audio.loadAll([
    './assets/jump.mp3',
    './assets/run.mp3',
    './assets/red_fire.mp3',
    './assets/red_fire_2.mp3',
    './assets/blue_fire.mp3',
    './assets/bg.mp3'
]);

game.sceneManager.addScene(new MyScene("Main"));
game.sceneManager.startScene("Main");
game.start();