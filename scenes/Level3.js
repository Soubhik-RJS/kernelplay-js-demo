import { Scene } from "kernelplay-js";
import { PlayerCube } from "../prefabs/PlayerCube.js";
import { Cube } from "../prefabs/Cube.js";

export class Level3 extends Scene {
  init() {
    this.addEntity(new PlayerCube(0, 0, 0));
    this.addEntity(new Cube(3, 0, 0));
    this.addEntity(new Cube(-3, 0, 0, true));
  }
}
