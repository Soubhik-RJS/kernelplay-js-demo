import {
    Entity,
    TransformComponent,
    ColliderComponent,
    BoxRenderComponent,
} from "kernelplay-js";

import { Layers } from "kernelplay-js";

export class Box extends Entity {
    constructor(x, y, isTrigger = false) {
        super("Box");

        this.layer = Layers.Player;
        this.tag = "box"

        this.addComponent("transform", new TransformComponent({
            position: { x, y },
        }));

        this.addComponent("collider", new ColliderComponent({isTrigger}));
        this.addComponent("renderer", new BoxRenderComponent("blue"));
    }
}
