import { Scene } from "kernelplay-js";
import { Player } from "../prefabs/Player.js";
import { Box } from "../prefabs/Box.js";

export class Level1 extends Scene {
  init() {
    this.addEntity(new Player(400, 100));

    this.addEntity(new Box(400, 300, "Wall"));
    this.addEntity(new Box(650, 370, "Wall"));
    this.addEntity(new Box(650, 170, "Wall"));
    this.addEntity(new Box(150, 170, "Wall"));
    this.addEntity(new Box(150, 360, "Wall"));

    this.addEntity(new Box(650, 120, "Coin"));
    this.addEntity(new Box(150, 315, "Coin"));
  }
}
