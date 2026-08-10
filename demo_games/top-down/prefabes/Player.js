import { Entity, TransformComponent, SpriteComponent, ColliderComponent, Rigidbody2DComponent, AnimatorComponent, AudioSource } from "kernelplay-js";
import { PlayerScript } from "../Script/PlayerScript.js";
import { PlayerAnimatorController } from "../animation/stats/PlayerAnimatorController.js";

export class Player extends Entity {
    constructor(x, y) {
        super("Player");
        this.tag = "player";

        this.addComponent("transform", new TransformComponent({
            position: { x: x, y: y },
            scale: { x: 1.4, y: 1.4 }
        }));

        this.addComponent("rigidbody2d", new Rigidbody2DComponent({
            useGravity: false,
            mass: 1,
            drag: 0.02
        }));

        this.addComponent("collider", new ColliderComponent({ width: 20, height: 45 }));

        this.addComponent("renderer", new SpriteComponent({
            image: "./assets/player_sheet.png",
            sourceWidth: 64,
            sourceHeight: 64,
            width: 50,
            height: 50,
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

        this.addComponent("script", new PlayerScript({
            speed: 200,
            force: 500,
        }));
    }
}