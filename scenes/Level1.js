import { Scene } from "kernelplay-js";
import { Player } from "../prefabs/Player.js";
import { Box } from "../prefabs/Box.js";

export class Level1 extends Scene {
  init() {
    this.addEntity(new Player(400, 300));
    this.addEntity(new Box(500, 300));
    this.addEntity(new Box(300, 300, true));
  }
}
