import { Scene } from "kernelplay-js";
import { Player1 } from "../prefabs/Player1.js";
import { Box1 } from "../prefabs/Box1.js";

export class Level2 extends Scene {
  init() {
    this.addEntity(new Player1(400, 300));
    this.addEntity(new Box1(500, 300));
    this.addEntity(new Box1(300, 300, true));
  }
}
