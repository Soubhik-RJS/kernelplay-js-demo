import {
    Entity,
    TransformComponent,
    ColliderComponent,
} from "kernelplay-js";

import {WebGLBoxRender2D } from "@kernelplay/pixi-renderer";
import { Layers } from "kernelplay-js";

export class Box1 extends Entity {
    constructor(x, y, isTrigger = false) {
        super("Box");

        this.layer = Layers.Player;
        this.tag = "box"

        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));

        this.addComponent("collider", new ColliderComponent({isTrigger}));
        this.addComponent("renderer", new WebGLBoxRender2D("#001eff"));
    }
}
