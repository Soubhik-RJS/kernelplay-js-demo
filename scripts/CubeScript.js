import { ScriptComponent, Keyboard, Mouse } from "kernelplay-js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { Layers } from "kernelplay-js";

export class CubeScript extends ScriptComponent {
    onStart() {
        const renderer = this.entity.scene.game.renderer;

        renderer.camera.position.x = 0;
        renderer.camera.position.y = 3;
        renderer.camera.position.z = 7;
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
        // this.rb = rb;

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

        if (rb.isGrounded) {
            if (Keyboard.isPressed(" ")) {
                rb.addForce(0, 20, 0, "impulse");
            }
        }

        if(transform.position.y < -20) {
            transform.setPosition(0, 3, 0);
        }
    }

    onTriggerEnter(other) {
        if(other.tag === "coin"){
            other.destroy();
            console.log("Coin collected !!!");
        }
    }
}