import { Entity, TransformComponent, CameraComponent, AudioListener } from "kernelplay-js";

export class Camera extends Entity {
    constructor(x, y, width, height) {
        super("Camera");

        this.tag = "camera";

        this.addComponent("transform", new TransformComponent({
            position: { x: x, y: y, z: 0 }
        }));

        this.addComponent("audioListener", new AudioListener());

        this.addComponent("camera", new CameraComponent({
            width: width,
            height: height,
            bounds: {
                minX: -1000,
                maxX: 1000,
                minY: 0,
                maxY: 600
            },
            isPrimary: true
        }));

    }
}