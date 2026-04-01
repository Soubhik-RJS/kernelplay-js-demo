import { Scene } from "kernelplay-js";
import { Player } from "../prefabs/Player.js";
import { Box } from "../prefabs/Box.js";
import { Entity, TransformComponent, CameraComponent } from "kernelplay-js";

export class Level1 extends Scene {
  init() {
    const player = new Player(400, 100);

    const camera = new Entity("MainCamera");
    camera.id = 100;
    camera.addComponent("transform", new TransformComponent({
      position: { x: 400, y: 300, z: 10 }
    }));
    camera.addComponent("camera", new CameraComponent({
      width: 800,
      height: 600,
      isPrimary: true,
      target: player,
    }));

    this.addEntity(camera);
    this.addEntity(player);

    this.addEntity(new Box(400, 300, "Wall"));
    this.addEntity(new Box(650, 370, "Wall"));
    this.addEntity(new Box(650, 170, "Wall"));
    this.addEntity(new Box(150, 170, "Wall"));
    this.addEntity(new Box(150, 360, "Wall"));

    this.addEntity(new Box(650, 120, "Coin"));
    this.addEntity(new Box(150, 315, "Coin"));
  }
}
