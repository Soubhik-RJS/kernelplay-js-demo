import {
    Entity,
    TransformComponent,
    ColliderComponent,
} from "kernelplay-js";

import {WebGLBoxRender2D } from "@kernelplay/pixi-renderer";
import { Layers } from "kernelplay-js";

export class Box1 extends Entity {
    constructor(x, y, name="Wall") {
        super(name);
        this.tag = name.toLowerCase();
        this.zIndex = -1;

        switch (name) {
            case "Wall":
                this.addComponent("transform", new TransformComponent({
                    position: { x, y },
                    scale: {x: 3, y: 1}
                }));
                this.addComponent("collider", new ColliderComponent({isTrigger:false}));
                this.addComponent("renderer", new WebGLBoxRender2D({color:"#135800"}));
                break;
        
            case "Coin":
                this.addComponent("transform", new TransformComponent({
                    position: { x, y },
                    scale: {x: 0.4, y: 0.4}
                }));
                this.addComponent("collider", new ColliderComponent({isTrigger:true}));
                this.addComponent("renderer", new WebGLBoxRender2D({color:"#ffea00"}));
                break;
        }
    }
}
