import { ScriptComponent, Keyboard, KeyCode } from "kernelplay-js";

export class PlayerScript extends ScriptComponent {
  onStart() {
    this.animator = this.entity.getComponent("animator");
    this.sprite = this.entity.getComponent("renderer");
    this.rb = this.entity.getComponent("rigidbody2d");
    this.transform = this.entity.getComponent("transform");
    this.audio = this.entity.getComponent("audio");
  }

  start() {
    super.start();
    this.camera.setTarget(this.entity);
  }

  update(dt) {
    this.rb.velocity.x = 0;
    this.rb.velocity.y = 0;

    if (Keyboard.isPressed(KeyCode.D) || Keyboard.isPressed("ArrowRight")) {
      this.rb.velocity.x = this.speed;
    } else if (Keyboard.isPressed(KeyCode.A) || Keyboard.isPressed("ArrowLeft")) {
      this.rb.velocity.x = -this.speed;
    }

    if (Keyboard.isPressed(KeyCode.W) || Keyboard.isPressed("ArrowUp")) {
      this.rb.velocity.y = -this.speed;
    } else if (Keyboard.isPressed(KeyCode.S) || Keyboard.isPressed("ArrowDown")) {
      this.rb.velocity.y = this.speed;
    }

    const isMoving = this.rb.velocity.x !== 0 || this.rb.velocity.y !== 0;
    if (isMoving) {
      this.audio.playLoop('run', { volume: 0.5 });
    } else {
      this.audio.stopLoop('run');
    }

    this.animator.setParameter("speedX", this.rb.velocity.x);
        this.animator.setParameter("speedY", this.rb.velocity.y);

  }
}