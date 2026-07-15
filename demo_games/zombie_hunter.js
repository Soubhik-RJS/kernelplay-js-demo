// -----------------------------------------------------------------------------
// NOTES
// -----------------------------------------------------------------------------
//
// User Interface (UI)
// The game includes a pre-release UI system starting from version v0.3.3.
// It is available for use and intended for testing and early development.
//
// The official UI system will be released in version v0.4.0 and will introduce
// a dedicated UI Canvas for rendering and managing user interface elements.
//
// -----------------------------------------------------------------------------

import { Game, Scene, Entity, ScriptComponent, ref, UIText, UIProgressBar, UIPanel } from "kernelplay-js";
import { PixiRenderer } from "@kernelplay/pixi-renderer";
import { TransformComponent, CameraComponent, ColliderComponent, Rigidbody2DComponent } from "kernelplay-js";
import { PixiSpriteComponent, PixiBoxRenderComponent } from "@kernelplay/pixi-renderer";
import { AnimatorComponent, AnimatorController, AnimationClip } from "kernelplay-js";
import { Keyboard, KeyCode, Mouse, MouseButton, Layers } from "kernelplay-js";
import { Mathf, Cooldown, Timer, Random, Vector2 } from "kernelplay-js";
import { AudioSource, AudioListener } from "kernelplay-js";
import * as PIXI from "pixi.js";

// This example demonstrates a simple 2D game setup using kernelplay-js and Pixi.js.
// Define a Camera entity that will serve as the main camera for the game.
class Camera extends Entity {
    constructor(x, y, w, h) {
        super("MainCamera");
        this.id = 100;
        this.addComponent("transform", new TransformComponent({
            position: { x: 400, y: 300, z: 0 }
        }));

        this.addComponent("camera", new CameraComponent({
            width: w,
            height: h,
            bounds: {
                minX: -900,
                maxX: 900,
                minY: -600,
                maxY: 600
            },
            isPrimary: true
        }));
        this.addComponent("audioListener", new AudioListener());
    }
}

// player animator controllers at the bottom of the file for better readability
function PlayerAnimatorController() {

    // Player animations clips
    const idleDown = new AnimationClip({ name: "idleDown", frames: [0], frameRate: 1, loop: true, gridWidth: 15, frameWidth: 32, frameHeight: 46 });
    const idleRight = new AnimationClip({ name: "idleRight", frames: [15], frameRate: 1, loop: true, gridWidth: 15, frameWidth: 32, frameHeight: 46 });
    const idleUp = new AnimationClip({ name: "idleUp", frames: [30], frameRate: 1, loop: true, gridWidth: 15, frameWidth: 32, frameHeight: 46 });
    const idleLeft = new AnimationClip({ name: "idleLeft", frames: [45], frameRate: 1, loop: true, gridWidth: 15, frameWidth: 32, frameHeight: 47 });

    const walkClipDown = new AnimationClip({
        name: "walkDown",
        frames: [1, 2, 3],
        frameRate: 6,
        loop: true,
        gridWidth: 15,
        frameWidth: 32,
        frameHeight: 46,
    });

    const walkClipRight = new AnimationClip({
        name: "walkRight",
        frames: [16, 17, 18],
        frameRate: 6,
        loop: true,
        gridWidth: 15,
        frameWidth: 32,
        frameHeight: 46,
    });

    const walkClipLeft = new AnimationClip({
        name: "walkLeft",
        frames: [46, 47, 48],
        frameRate: 6,
        loop: true,
        gridWidth: 15,
        frameWidth: 32,
        frameHeight: 47,
    });

    const walkClipUp = new AnimationClip({
        name: "walkUp",
        frames: [31, 32, 33],
        frameRate: 6,
        loop: true,
        gridWidth: 15,
        frameWidth: 32,
        frameHeight: 46,
    });

    const attackDown = new AnimationClip({
        name: "attack_down",
        frames: [
            { x: 312, y: 0, w: 34, h: 46 },
            { x: 352, y: 0, w: 34, h: 46 },
            { x: 392, y: 0, w: 34, h: 46 },
            { x: 432, y: 0, w: 34, h: 46 }
        ],
        frameRate: 12,
        loop: true
    });

    const attackRight = new AnimationClip({
        name: "attack_right",
        frames: [
            { x: 312, y: 46, w: 34, h: 46 },
            { x: 352, y: 46, w: 34, h: 46 },
            { x: 392, y: 46, w: 34, h: 46 },
            { x: 432, y: 46, w: 34, h: 46 }
        ],
        frameRate: 12,
        loop: true
    });

    const attackUp = new AnimationClip({
        name: "attack_up",
        frames: [
            { x: 312, y: 92, w: 34, h: 46 },
            { x: 352, y: 92, w: 34, h: 46 },
            { x: 392, y: 92, w: 34, h: 46 },
            { x: 432, y: 92, w: 34, h: 46 }
        ],
        frameRate: 12,
        loop: true
    });

    const attackLeft = new AnimationClip({
        name: "attack_left",
        frames: [
            { x: 312, y: 138, w: 34, h: 46 },
            { x: 352, y: 138, w: 34, h: 46 },
            { x: 392, y: 138, w: 34, h: 46 },
            { x: 432, y: 138, w: 34, h: 46 }
        ],
        frameRate: 12,
        loop: true
    });

    return new AnimatorController()

        // --- PARAMETERS ---
        .addParameter("speedX", "float", 0)
        .addParameter("speedY", "float", 0)
        .addParameter("isAttacking", "bool", false)

        // --- STATES ---
        .addState("idleDown", idleDown)
        .addState("idleUp", idleUp)
        .addState("idleRight", idleRight)
        .addState("idleLeft", idleLeft)
        .addState("walkDown", walkClipDown)
        .addState("walkUp", walkClipUp)
        .addState("walkRight", walkClipRight)
        .addState("walkLeft", walkClipLeft)
        .addState("attackDown", attackDown)
        .addState("attackUp", attackUp)
        .addState("attackRight", attackRight)
        .addState("attackLeft", attackLeft)

        // --- TRANSITIONS: WALK -> IDLE ---
        .addTransition("walkRight", "idleRight", {
            conditions: [{ param: "speedX", op: "<=", value: 0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkLeft", "idleLeft", {
            conditions: [{ param: "speedX", op: ">=", value: -0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkDown", "idleDown", {
            conditions: [{ param: "speedY", op: "<=", value: 0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkUp", "idleUp", {
            conditions: [{ param: "speedY", op: ">=", value: -0.1 }],
            hasExitTime: false, duration: 0
        })

        // --- TRANSITIONS: IDLE -> WALK ---
        .addTransition("idleDown", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleUp", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleLeft", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleRight", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })

        .addTransition("idleDown", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleUp", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleLeft", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleRight", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })

        .addTransition("idleDown", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleUp", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleLeft", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleRight", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })

        .addTransition("idleDown", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleUp", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleLeft", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleRight", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })

        // --- TRANSITIONS: IDLE -> ATTACK ---
        .addTransition("idleRight", "attackRight", {
            conditions: [{ param: "isAttacking", op: "==", value: true }],
            hasExitTime: false, duration: 0, priority: 3
        })
        .addTransition("idleLeft", "attackLeft", {
            conditions: [{ param: "isAttacking", op: "==", value: true }],
            hasExitTime: false, duration: 0, priority: 3
        })
        .addTransition("idleDown", "attackDown", {
            conditions: [{ param: "isAttacking", op: "==", value: true }],
            hasExitTime: false, duration: 0, priority: 3
        })
        .addTransition("idleUp", "attackUp", {
            conditions: [{ param: "isAttacking", op: "==", value: true }],
            hasExitTime: false, duration: 0, priority: 3
        })

        // --- TRANSITIONS: ATTACK -> IDLE ---
        .addTransition("attackRight", "idleRight", {
            conditions: [{ param: "isAttacking", op: "==", value: false }],
            hasExitTime: false, duration: 0
        })
        .addTransition("attackLeft", "idleLeft", {
            conditions: [{ param: "isAttacking", op: "==", value: false }],
            hasExitTime: false, duration: 0
        })
        .addTransition("attackDown", "idleDown", {
            conditions: [{ param: "isAttacking", op: "==", value: false }],
            hasExitTime: false, duration: 0
        })
        .addTransition("attackUp", "idleUp", {
            conditions: [{ param: "isAttacking", op: "==", value: false }],
            hasExitTime: false, duration: 0
        });
}

// enemy animator controllers at the bottom of the file for better readability
function ZombieAnimatorController() {
    // Zombie animations clips

    const zombieIdleRight = new AnimationClip({
        name: "zombie_idle_right",
        frames: [
            { x: 48, y: 64, w: 48, h: 64 }
        ],
        frameRate: 1,
        loop: true
    });

    const zombieIdleLeft = new AnimationClip({
        name: "zombie_idle_left",
        frames: [
            { x: 48, y: 192, w: 48, h: 64 }
        ],
        frameRate: 1,
        loop: true
    });

    const zombieWalkRight = new AnimationClip({
        name: "zombie_walk_right",
        frames: [
            { x: 0, y: 64, w: 48, h: 64 },
            { x: 48, y: 64, w: 48, h: 64 },
            { x: 96, y: 64, w: 48, h: 64 }
        ],
        frameRate: 8,
        loop: true
    });

    const zombieWalkLeft = new AnimationClip({
        name: "zombie_walk_left",
        frames: [
            { x: 0, y: 192, w: 48, h: 64 },
            { x: 48, y: 192, w: 48, h: 64 },
            { x: 96, y: 192, w: 48, h: 64 }
        ],
        frameRate: 8,
        loop: true
    });

    return new AnimatorController()
        // We only care about X (Left/Right) now!
        .addParameter("speedX", "float", 0)

        // Only 4 States Needed
        .addState("idleRight", zombieIdleRight)
        .addState("idleLeft", zombieIdleLeft)
        .addState("walkRight", zombieWalkRight)
        .addState("walkLeft", zombieWalkLeft)

        // --- TRANSITIONS: WALK -> IDLE ---
        .addTransition("walkRight", "idleRight", {
            conditions: [{ param: "speedX", op: "<=", value: 0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkLeft", "idleLeft", {
            conditions: [{ param: "speedX", op: ">=", value: -0.1 }],
            hasExitTime: false, duration: 0
        })

        // --- TRANSITIONS: IDLE -> WALK ---
        .addTransition("idleRight", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0 })
        .addTransition("idleLeft", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0 })

        .addTransition("idleRight", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0 })
        .addTransition("idleLeft", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0 });
}

export class PlayerScript extends ScriptComponent {

    health = 100;
    maxHealth = 100;

    // --- LIFECYCLE ---
    onStart() {
        this.animator = this.entity.getComponent("animator");
        this.rb = this.entity.getComponent("rigidbody2d");
        this.sprite = this.entity.getComponent("renderer");
        this.collider = this.entity.getComponent("collider");
        this.transform = this.entity.getComponent("transform");
        this.audio = this.entity.getComponent("audio");

        this.isAttacking = false;
        this._isRunningSoundPlaying = false;
        this.fireCooldown = new Cooldown(1);
        this.isLose = false;
        this.score = 0;
    }

    update(dt) {
        // If we are currently swinging the sword, completely ignore all other logic
        if (this.isLose) return;
        this.scene.score.text = `Score: ${this.score}`;
        this.fireCooldown.update(dt);

        this.transform.position.x = Mathf.clamp(this.transform.position.x, -884, 884)
        this.transform.position.y = Mathf.clamp(this.transform.position.y, -575, 575)
        if (this.isAttacking) {
            this.rb.velocity.x = 0;
            this.rb.velocity.y = 0;
            return;
        }

        this.handleMovement();
        this.handleAttack();

        if (this.health <= 0) {
            this.getKill();
        }
        this.scene.healthBar.setValue(this.health / this.maxHealth);
    }


    // --- MOVEMENT ---
    handleMovement() {
        this.rb.velocity.x = 0;
        this.rb.velocity.y = 0;

        if (Keyboard.isPressed("ArrowRight")) {
            this.rb.velocity.x = this.speed;
        } else if (Keyboard.isPressed("ArrowLeft")) {
            this.rb.velocity.x = -this.speed;
        }

        if (Keyboard.isPressed("ArrowUp")) {
            this.rb.velocity.y = -this.speed;
        } else if (Keyboard.isPressed("ArrowDown")) {
            this.rb.velocity.y = this.speed;
        }

        const isMoving = this.rb.velocity.x !== 0 || this.rb.velocity.y !== 0;
        if (isMoving) {
            this.audio.playLoop('run', { volume: 0.5 });
        } else {
            this.audio.stopLoop('run');
        }

        // if (isMoving) {
        //     if (!this._isRunningSoundPlaying) {
        //         this.runSound();
        //         this._isRunningSoundPlaying = true;
        //         console.log("running");
        //     }
        // } else {
        //     if (this._isRunningSoundPlaying) {
        //         this.audio.stopAll();
        //         this._isRunningSoundPlaying = false;
        //     }
        // }

        // Update animator parameters so it knows which idle/walk state to be in
        this.animator.setParameter("speedX", this.rb.velocity.x);
        this.animator.setParameter("speedY", this.rb.velocity.y);
    }

    hitSound() {
        this.audio.playOneShot('hurt', { volume: 1.0 });
    }

    // --- ATTACK ---
    handleAttack() {
        // 1. Use the string format to prevent KeyCode errors
        // Check if your engine uses isPressed (holding) or wasPressed (single tap)
        const pressingAttack = Keyboard.isPressed(KeyCode.Space);
        // const pressingAttack = Keyboard.wasPressed(KeyCode.Space);

        // 2. Are we holding any movement keys?
        const isTryingToMove = this.rb.velocity.x !== 0 || this.rb.velocity.y !== 0;

        // 3. STRICT RULE: Only attack if button is pressed, we aren't already attacking, AND we are standing still!
        if (pressingAttack && !this.isAttacking && !isTryingToMove && this.fireCooldown.trigger()) {
            // this.attackSound();
            this.audio.playOneShot('attack', { volume: 1.0 });
            this.triggerAttack();
            this.Attack();
        }
    }

    ColliderReset() {
        this.collider.width = 32;
        this.collider.height = 50;
        this.collider.isTrigger = false;
    }

    Attack() {
        this.collider.width = 60;
        this.collider.height = 60;
        this.collider.isTrigger = true;
    }

    getKill() {
        this.isLose = true;
        this.scene.healthBar.setValue(0);
        this.instantiate(PlayerCorpse, this.transform.position.x, this.transform.position.y);
        this.audio.stopAll();
        this.audio.playOneShot('lose', { volume: 1.0 });
        this.game.audio.stopBGM(1.0);
        this.destroy();
    }

    getDamage() {
        this.health -= 25;
        if (this.score - 25 > 0) {
            this.score -= 25;
        }
    }

    triggerAttack() {
        this.isAttacking = true;

        // Ensure the animator knows we are stopped and attacking
        this.animator.setParameter("speedX", 0);
        this.animator.setParameter("speedY", 0);
        this.animator.setParameter("isAttacking", true);

        // Your attack clips are 4 frames at 12 fps. 
        // 4 / 12 = 0.333 seconds (333 milliseconds).
        // We set the timeout to 350ms to give the animation exactly enough time to finish playing once.
        setTimeout(() => {
            this.isAttacking = false;
            this.animator.setParameter("isAttacking", false);
            this.ColliderReset();
        }, 350);
    }

    onTriggerEnter(other) {
        if (other.name === "Enemy" && this.isAttacking) {
            other.getComponent("script").getDamage();
            this.instantiate(ZombieHit, other.getComponent("transform").position.x, other.getComponent("transform").position.y);
            this.isAttacking = false;
        }

        if (other.name === "Trap") {
            // this.flashRedSmooth(this.sprite.object);
            // this.hitSound();
            this.audio.playOneShot('hurt', { volume: 1.0 });
            this.instantiate(PlayerHit, this.transform.position.x, this.transform.position.y);
            this.getKill();
        }
    }

    flashRedSmooth(sprite) {
        sprite.tint = 0xff0000;
        sprite.alpha = 0.5;

        setTimeout(() => {
            sprite.tint = 0xffffff;
            sprite.alpha = 1;
            // this.instantiate(PlayerHit, this.transform.position.x, this.transform.position.y);
            this.getKill();
        }, 420);
    }
}

class EnemyScript extends ScriptComponent {

    // Configurable variables
    detectionRadius = 250;
    stoppingDistance = 55;

    slowDuration = 1.5;
    slowMultiplier = 0.3;

    // --- ATTACK TIMERS ---
    attackWindUp = 1.0;   // Wait 1 second before the FIRST attack
    attackCooldown = 1.0; // Wait 2 seconds between attacks after the first one
    health = 100;

    onStart() {
        this.transform = this.entity.getComponent("transform");
        this.rb = this.entity.getComponent("rigidbody2d");
        this.animator = this.entity.getComponent("animator");
        this.sprite = this.entity.getComponent("renderer");
        this.audio = this.entity.getComponent("audio");

        this.currentSlowTimer = 0;
        this.currentAttackTimer = this.attackWindUp;
        this.knockbackTimer = 0;
    }

    update(dt) {
        // Tick down the slow timer no matter what
        if (this.currentSlowTimer > 0) {
            this.currentSlowTimer -= dt;
        }

        // --- SAFETY CHECK ---
        // If the player doesn't exist, OR the player was destroyed, stop moving and go idle!
        if (!this.player || !this.player.getComponent("transform")) {
            this.rb.velocity.x = 0;
            this.rb.velocity.y = 0;
            this.updateAnimator();
            return;
        }

        // If we are currently flying backward from a hit, ignore the AI!
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= dt;
            this.updateAnimator(); // Keep the sprite facing the right way
            return; // EXIT EARLY so we don't overwrite the addForce physics
        }

        const playerPos = this.player.getComponent("transform").position;
        const enemyPos = this.transform.position;

        // let dirX = playerPos.x - enemyPos.x;
        // let dirY = playerPos.y - enemyPos.y;
        // const distance = Math.sqrt(dirX * dirX + dirY * dirY);

        // 1. Get exact distance instantly
        const distance = Vector2.distance(playerPos, enemyPos);

        // --- MOVEMENT LOGIC ---
        if (distance > this.detectionRadius) {

            // 1. AGGRO CHECK: Too far away. Stop moving.
            this.rb.velocity.x = 0;
            this.rb.velocity.y = 0;

        } else if (distance > this.stoppingDistance) {

            // 2. CHASE CHECK: Outside stopping range. Chase!
            this.currentAttackTimer = this.attackWindUp;

            let activeSpeed = this.speed;
            if (this.currentSlowTimer > 0) {
                activeSpeed *= this.slowMultiplier;
            }

            // 2. Get the direction TO the player and normalize it instantly
            let moveDir = Vector2.sub(playerPos, enemyPos).normalize();

            // 3. Apply velocity
            this.rb.velocity.x = moveDir.x * activeSpeed * dt;
            this.rb.velocity.y = moveDir.y * activeSpeed * dt;

        } else {

            // 3. ATTACK CHECK: We are touching the player!
            this.rb.velocity.x = 0;
            this.rb.velocity.y = 0;

            this.currentSlowTimer = this.slowDuration;
            this.currentAttackTimer -= dt;

            if (this.currentAttackTimer <= 0) {
                // console.log("Enemy Attacked!");

                if (this.camera) {
                    this.camera.shake(10, 0.5);
                }

                const playerScript = this.player.getComponent("script");
                if (playerScript && playerScript.getDamage) {
                    playerScript.getDamage();
                    playerScript.hitSound();
                    this.instantiate(PlayerHit, playerPos.x, playerPos.y);
                    this.flashRedSmooth(this.player.getComponent("renderer").PixiSprite);

                }

                this.currentAttackTimer = this.attackCooldown;
            }
        }

        // --- DEATH CHECK ---
        if (this.health <= 0) {
            this.getKill();
            return; // Safe to return here because the enemy is dead!
        }

        // --- UPDATE ANIMATOR ---
        this.updateAnimator();
    }

    flashRedSmooth(sprite) {
        sprite.tint = 0xff0000;
        sprite.alpha = 0.5;

        setTimeout(() => {
            sprite.tint = 0xffffff;
            sprite.alpha = 1;
        }, 420);
    }

    updateAnimator() {
        if (this.animator) {
            this.animator.setParameter("speedX", this.rb.velocity.x);
        }
    }

    // --- DAMAGE FUNCTION ---
    getDamage() {
        this.health -= 25;

        // 1. Stun the AI for 0.2 seconds so the force works
        this.knockbackTimer = 0.2;

        // 2. Default direction (Right) using your Vector2 class
        let pushDir = new Vector2(1, 0);

        if (this.player && this.player.getComponent("transform")) {
            const playerPos = this.player.getComponent("transform").position;
            const enemyPos = this.transform.position;

            // 3. Vector Math Magic! 
            // Subtract gets the direction away from the player, and normalize() makes it length 1.
            pushDir = Vector2.sub(enemyPos, playerPos).normalize();
        }

        // 3. Apply the force in the correct direction!
        const force = 200;
        this.rb.addForce(pushDir.x * force, pushDir.y * force, "impulse");
    }

    getKill() {
        this.player.getComponent("script").score += 100;
        if (this.player.getComponent("script").health < 100) {
            this.player.getComponent("script").health += 10;
        }
        this.audio.playOneShot('killed', { volume: 1.0 });
        // 1. Reset Health (Assuming max health is 100)
        this.health = 100;

        // 2. Generate a random position within your world bounds
        // I'm using Random.int to keep the coordinates as clean whole numbers
        const randomX = Random.int(-900, 900);
        const randomY = Random.int(-600, 600);

        // 3. Teleport the enemy to the new position
        this.transform.position.x = randomX;
        this.transform.position.y = randomY;

        // 4. Reset physics and state! 
        // If we don't do this, they might spawn still flying backward from the knockback!
        this.rb.velocity.x = 0;
        this.rb.velocity.y = 0;

        this.knockbackTimer = 0;
        this.currentSlowTimer = 0;
        this.currentAttackTimer = this.attackWindUp; // Reset the attack wind-up
    }
}

function Enemy(entity, x, y) {
    entity.name = "Enemy";
    entity.addComponent("transform", new TransformComponent({
        position: { x, y }
    }));

    entity.addComponent("rigidbody2d", new Rigidbody2DComponent({
        useGravity: false
    }));
    entity.addComponent("collider", new ColliderComponent({ isTrigger: false }));
    entity.addComponent("renderer", new PixiSpriteComponent({
        image: "./assets/zombie_sheet.png",
        sourceX: 48,
        sourceY: 128,
        sourceWidth: 48,
        sourceHeight: 64,
        width: 60,
        height: 62,
    }));

    entity.addComponent("animator", new AnimatorComponent({ controller: ZombieAnimatorController() }));

    entity.addComponent("script", new EnemyScript({
        speed: 1000 * 5,
        player: ref(200)
    }));

    entity.addComponent("audio", new AudioSource({
        clips: {
            killed: './assets/enemy-die.mp3',
        },
        volume: 1.0,
    }));
}

// Define a Player entity that will be controlled by the user.
class Player extends Entity {
    constructor(x, y) {
        super("Player");
        this.id = 200;
        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));

        this.addComponent("rigidbody2d", new Rigidbody2DComponent({
            useGravity: false
        }));

        this.addComponent("collider", new ColliderComponent({ width: 32, height: 50 }));

        this.addComponent("renderer", new PixiSpriteComponent({
            image: "./assets/player_sprite_sheet.png",
            sourceWidth: 33,
            sourceHeight: 40,
            width: 35,
            height: 50,
        }));

        this.addComponent("animator", new AnimatorComponent({ controller: PlayerAnimatorController() }));

        this.addComponent("audio", new AudioSource({
            clips: {
                run: './assets/run_bit1.wav',
                hurt: './assets/damage.wav',
                attack: './assets/attack.wav',
                lose: './assets/lose.mp3',
            },

            volume: 0.15
        }));

        this.addComponent("script", new PlayerScript({
            speed: 200
        }));
    }
}

class BackGround extends Entity {
    constructor(x, y) {
        super("BackGround");
        this.zIndex = -100;
        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));

        this.addComponent("renderer", new PixiSpriteComponent({
            image: "./assets/background.png",
            width: 1800,
            height: 1200,
        }));
    }
}

class Blocker extends Entity {
    constructor(x, y, w, h) {
        super("Blocker");
        this.addComponent("transform", new TransformComponent({
            position: { x, y },
            scale: { x: w, y: h },
        }));
        this.addComponent("collider", new ColliderComponent());
    }
}

class Trap extends Entity {
    constructor(x, y, w, h) {
        super("Trap");
        this.addComponent("transform", new TransformComponent({
            position: { x, y },
            scale: { x: w, y: h },
        }));
        this.addComponent("collider", new ColliderComponent({ isTrigger: true }));
    }
}

function ZombieHit(entity, x, y) {
    entity.name = "ZombieHit";
    entity.addComponent("transform", new TransformComponent({
        position: { x, y }
    }));

    const hitClip = new AnimationClip({
        name: "zombie_hit",
        frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        frameRate: 10,
        loop: false,
        gridWidth: 16,
        frameWidth: 512,
        frameHeight: 512,
    });

    const controller = new AnimatorController()
        .addState("hit", hitClip);

    entity.addComponent("renderer", new PixiSpriteComponent({
        image: "./assets/zombie_hit_sheet.png",
        sourceWidth: 512,
        sourceHeight: 512,
        width: 70,
        height: 70,
    }));

    entity.addComponent("animator", new AnimatorComponent({ controller }));

    entity.addComponent("script", new class extends ScriptComponent {
        onStart() {
            setTimeout(() => this.destroy(), 333);
        }
    }());
}

function PlayerHit(entity, x, y) {
    entity.name = "PlayerHit";
    entity.addComponent("transform", new TransformComponent({
        position: { x, y }
    }));

    const hitClip = new AnimationClip({
        name: "player_hit",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        frameRate: 10,
        loop: true,
        gridWidth: 16,
        frameWidth: 512,
        frameHeight: 512,
    });

    const controller = new AnimatorController()
        .addState("hit", hitClip);

    entity.addComponent("renderer", new PixiSpriteComponent({
        image: "./assets/player_hit_sheet.png",
        sourceWidth: 512,
        sourceHeight: 512,
        width: 120,
        height: 120,
    }));

    entity.addComponent("animator", new AnimatorComponent({ controller }));

    entity.addComponent("script", new class extends ScriptComponent {
        onStart() {
            setTimeout(() => this.entity.destroy(), 666);
        }
    }());
}

function PlayerCorpse(entity, x, y) {
    entity.name = "PlayerCorpse";
    entity.addComponent("transform", new TransformComponent({
        position: { x, y }
    }));

    entity.addComponent("renderer", new PixiSpriteComponent({
        image: "./assets/player_sprite_sheet.png",
        sourceX: 160,
        sourceY: 43,
        sourceWidth: 32,
        sourceHeight: 46,
        width: 35,
        height: 50,
    }));

    // Rotate the sprite to make it look like it's lying down
    entity.getComponent("transform").rotation.z = Math.PI / -2;

    entity.addComponent("script", new class extends ScriptComponent {
        onStart() {
            const sprite = this.entity.getComponent("renderer").PixiSprite;
            sprite.tint = 0xff0000; // RED the corpse
        }
    }());
}


class Level extends Scene {
    init() {
        this.gameover = false;
        const width = this.game.config.width;
        const height = this.game.config.height;

        const player = new Player(400, 300);
        const camera = new Camera(400, 300, width, height);

        camera.getComponent("camera").setTarget(player);
        camera.getComponent("camera").zoom = 1.5;


        this.addEntity(camera);
        this.addEntity(player);
        this.playerScript = player.getComponent("script");

        this.addEntity(new BackGround(0, 0));

        const numberOfEnemies = 20;

        for (let i = 0; i < numberOfEnemies; i++) {
            // 1. Generate random coordinates within your game bounds
            const randomX = Random.int(-900, 900);
            const randomY = Random.int(-600, 600);

            // 2. Spawn the enemy at that random spot!
            this.spawn(Enemy, randomX, randomY);
        }

        this.addEntity(new Blocker(566, 223, 2, 2));
        this.addEntity(new Blocker(-327, 417, 3, 3.5));
        this.addEntity(new Blocker(-735, -189, 3, 3.5));
        this.addEntity(new Blocker(-64, -33, 2, 3.5));
        this.addEntity(new Blocker(598, -429, 5, 7));
        this.addEntity(new Trap(270, 253, 0.5, 0.5));
        this.addEntity(new Trap(-579, 13, 0.5, 0.5));

        this.score = game.ui.add(new UIText({
            text: "Score: 0",
            anchor: "topLeft",
            offset: { x: 20, y: 20 },
            style: {
                textColor: "#ffffff",
                fontSize: 20,
                fontWeight: "bold",
            },
        }));

        this.healthBar = game.ui.add(new UIProgressBar({
            value: 1.0,          // 1.0 = full
            direction: "left",       // fills left → right
            anchor: "topRight",
            offset: { x: 20, y: 20 },
            width: 200,
            height: 20,
            showText: false,
            style: {
                progressTrackColor: "#8e8e8e57",
                progressFillColor: "#0bdc00",   // red health bar
                borderRadius: 0,
            },
        }));

        this.panel = game.ui.add(new UIPanel({
            anchor: "center",
            offset: { x: 0, y: 0 },
            width: 400,
            height: 300,
            zIndex: 0,
            visible: false,

            // per-element style overrides
            style: {
                surfaceColor: "#1a1a2e79",
                borderColor: "#e63946",
                borderWidth: 2,
                borderRadius: 12,
            },
        }));

        this.GameOver = game.ui.add(new UIText({
            text: "Game Over",
            anchor: "center",
            offset: { x: 0, y: -50 },
            visible: false,
            style: {
                textColor: "#ffffff",
                fontSize: 40,
                fontWeight: "bolder",
            },
        }));

        this.BestScore = game.ui.add(new UIText({
            text: `Best Score: ${this.playerScript.score}
            Press 'R' to restart`,
            anchor: "center",
            offset: { x: 0, y: 100 },
            visible: false,
            style: {
                textColor: "#ffffff",
                fontSize: 20,
                fontWeight: "bold",
            },
        }));

        game.audio.playBGM('./assets/bg-8bit.mp3', { loop: true });
        game.audio.setBGMVolume(0.15);
    }

    update(dt) {
        super.update(dt);
        if(this.playerScript.isLose && !this.gameover){
            this.gameover = true;
            this.panel.visible = true;
            this.GameOver.visible = true;
            this.BestScore.visible = true;
            this.BestScore.text = `Best Score: ${this.playerScript.score}  Press 'R' to restart`;
            console.log('game over');
        }
        if(Keyboard.isPressed(KeyCode.R) && this.gameover){
            // this.game.sceneManager.startScene("Level");
            location.reload();
        }
    }
}


class MyGame extends Game {
    init() {
        this.sceneManager.addScene(new Level("Level"));
        this.sceneManager.startScene("Level");
    }
}

const game = new MyGame({
    renderer: new PixiRenderer(),
    width: 800,
    height: 600,
    fps: 60,
    // debugPhysics: true,
    container: "#canvas-container"
});

// Preload all assets BEFORE starting
await PIXI.Assets.load([
    "./assets/player_sprite_sheet.png",
    "./assets/zombie_sheet.png",
    "./assets/player_hit_sheet.png",
    "./assets/zombie_hit_sheet.png",
    "./assets/background.png",
]);

await game.audio.loadAll([
    './assets/run_bit1.wav',
    './assets/damage.wav',
    './assets/attack.wav',
    './assets/lose.mp3',
    './assets/enemy-die.mp3',
    './assets/bg-8bit.mp3'
]);

game.start();
