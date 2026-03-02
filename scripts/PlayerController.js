import { ScriptComponent, Keyboard, Mouse, Layers } from "kernelplay-js";

export class PlayerController extends ScriptComponent {
    onStart(){
        this.pos = this.entity.getComponent("transform").position;
    }

    update(dt) {
        const rb = this.entity.getComponent("rigidbody2d");

        rb.velocity.x = 0;
        // rb.velocity.y = 0;

        if (Keyboard.isPressed("ArrowRight")) rb.velocity.x = 200;
        if (Keyboard.isPressed("ArrowLeft")) rb.velocity.x = -200;
        if (Keyboard.isPressed("ArrowUp")) rb.velocity.y = -200;
        if (Keyboard.isPressed("ArrowDown")) rb.velocity.y = 200;

        if (Mouse.wasPressed(0)) {
            const hit = this.entity.scene.raycast(Mouse.x, Mouse.y, {
                layerMask: Layers.Player
            });

            console.log("Hit (Player layer only):", hit?.entity?.tag);
        }

        if (rb.isGrounded) {
            if (Keyboard.isPressed(" ")) {
                rb.addForce(0, -600, "impulse");
                this.isGround = false;
            }
        }

        if(this.pos.x > 1000, this.pos.y > 1000) {
            this.pos.x = 400;
            this.pos.y = 100;
        }
    }

    // onCollision(other) {
    //     // Called when a solid collision occurs
    //     console.log("Player hit:", other.name);
    // }

    onTriggerEnter(other) {
        // Called when entering a trigger collider
        // console.log("Player entered trigger:", other.tag);
        if (other.tag === "coin") {
            other.destroy();
            console.log("Coin collected !!!");
            
        }
    }
}
