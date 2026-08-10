import { TransformComponent, SpriteComponent, ColliderComponent } from "kernelplay-js";

export function Object(entity, x, y, skin = "tree") {
    entity.name = "Platform";
    entity.tag = "platform";

    entity.addComponent("transform", new TransformComponent({
        position: { x: x, y: y },
        scale: { x: 2.3, y: 2.3 }
    }));

    entity.addComponent("collider", new ColliderComponent({
        isTrigger: false,   // true = trigger events only, no physics push
        offset: { x: 0, y: 0 }
    }));

    entity.addComponent("renderer", new SpriteComponent({
        image: skin == "tree" ? "./assets/tree.png" : "./assets/rock.png",
        // sourceWidth: 1000,
        // sourceHeight: 250,
        width: 50,
        height: 50,
        anchor: { x: 0.5, y: 0.5 },
        zIndex: 10,
    }));
}