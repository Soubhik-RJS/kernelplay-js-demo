import {
    Entity,
    TransformComponent,
    ColliderComponent,
    WebGLBoxRender2D,
    Rigidbody2DComponent
} from "kernelplay-js";

import { PlayerController } from "../scripts/PlayerController.js";
import { Layers } from "kernelplay-js";

export class Player1 extends Entity {
    constructor(x, y) {
        super("Player");

        this.layer = Layers.Player;
        this.tag = "player"

        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));
        this.addComponent("rigidbody2d",new Rigidbody2DComponent({
            useGravity: false
        }));
        this.addComponent("collider", new ColliderComponent());
        this.addComponent("renderer", new WebGLBoxRender2D("#ff0000"));
        this.addComponent("playerController", new PlayerController());
    }
}
