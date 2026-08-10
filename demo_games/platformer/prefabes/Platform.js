import { TransformComponent, SpriteComponent, ColliderComponent } from "kernelplay-js";

export function Platform(entity, x, y) {
    entity.name = "Platform";
    entity.tag = "platform";

    entity.addComponent("transform", new TransformComponent({
        position: { x: x, y: y },
        scale: { x: 5, y: 1 }
    }));

    entity.addComponent("collider", new ColliderComponent({
        isTrigger: false,   // true = trigger events only, no physics push
        offset: { x: 0, y: 0 }
    }));

    entity.addComponent("renderer", new SpriteComponent({
        image: "./assets/brick.jpg",
        sourceWidth: 1000,
        sourceHeight: 250,
        width: 50,
        height: 50,
        anchor: { x: 0.5, y: 0.5 },
        zIndex: 10,
    }));
}