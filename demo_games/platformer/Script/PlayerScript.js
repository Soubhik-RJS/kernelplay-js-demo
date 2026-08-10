import { ScriptComponent, Keyboard, KeyCode } from "kernelplay-js";

export class PlayerScript extends ScriptComponent {
  onStart() {
    this.animator = this.entity.getComponent("animator");
    this.sprite = this.entity.getComponent("renderer");
    this.rb = this.entity.getComponent("rigidbody2d");
    this.transform = this.entity.getComponent("transform");
    this.audio = this.entity.getComponent("audio");
  }

  start(){
    super.start();
    this.camera.setTarget(this.entity);
  }

  update(dt) {
    this.rb.velocity.x = 0;

    if (Keyboard.isPressed(KeyCode.A) || Keyboard.isPressed(KeyCode.ArrowLeft)) {
      this.rb.velocity.x = -this.speed;
      this.sprite.flipX = true;
    }

    if (Keyboard.isPressed(KeyCode.D) || Keyboard.isPressed(KeyCode.ArrowRight)) {
      this.rb.velocity.x = this.speed;
      this.sprite.flipX = false;
    }

    const isMoving = this.rb.velocity.x !== 0;
    this.animator.setParameter("speed", isMoving ? 1 : 0);
    this.animator.setParameter("isGrounded", this.rb.isGrounded);

    if (this.rb.isGrounded && Keyboard.wasPressed(KeyCode.Space)) {
      this.rb.addForce(0, -this.force, "impulse");
      this.audio.stopLoop('run');          // cut run sound immediately
      this.audio.playOneShot('jump', { volume: 0.1 });
      this.animator.setTrigger("jump");
    }

    if (isMoving && this.rb.isGrounded) {
      this.audio.playLoop('run', { volume: 0.5 });
    } else {
      this.audio.stopLoop('run');
    }
  }
}