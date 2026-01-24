import { ScriptComponent, Keyboard, Mouse } from "kernelplay-js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { Layers } from "kernelplay-js";

export class CubeScript extends ScriptComponent {
    onStart() {
        const renderer = this.entity.scene.game.renderer;

        // OrbitControls
        const controls = new OrbitControls(renderer.camera, renderer.renderer.domElement);
        controls.enableDamping = true;       // smooth motion
        controls.dampingFactor = 0.05;
        controls.target.set(0, 1, 0);        // focus point
        controls.update();
    }

    update(dt) {
        const transform = this.entity.getComponent("transform");
        const rb = this.entity.getComponent("rigidbody");

        rb.velocity.x = 0;
        rb.velocity.z = 0;

        if (Keyboard.isPressed("ArrowRight")) rb.velocity.x = 200 * dt;
        if (Keyboard.isPressed("ArrowLeft")) rb.velocity.x = -200 * dt;
        if (Keyboard.isPressed("ArrowUp")) rb.velocity.z = -200 * dt;
        if (Keyboard.isPressed("ArrowDown")) rb.velocity.z = 200 * dt;

        if (Mouse.wasPressed(0)) {
            const hit = this.entity.scene.raycast(Mouse.x, Mouse.y);

            // const hit = this.entity.scene.raycast(Mouse.x, Mouse.y,{
            //     layerMask: Layers.Player
            // });

            // const hit = this.entity.scene.pick(Mouse.x, Mouse.y);
            if (hit) {
                // raycast
                console.log("Clicked:", hit.entity.name, hit.distance, hit.point);

                // pick
                // console.log("Clicked:", hit.name, hit.tag);
                // console.log("Clicked:", hit);
            }
        }
    }

    onCollision(other) {
        // Called when a solid collision occurs
        console.log("Player hit:", other.name);
    }

    onTriggerEnter(other) {
        // Called when entering a trigger collider
        console.log("Player entered trigger:", other.name);
    }
}