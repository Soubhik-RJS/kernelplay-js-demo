import { Scene } from "kernelplay-js";
import { PlayerCube } from "../prefabs/PlayerCube.js";
import { Cube } from "../prefabs/Cube.js";

export class Level3 extends Scene {
  init() {
    this.addEntity(new PlayerCube(0, 3, 0));

    this.addEntity(new Cube(0, 0, 0, "Ground"));
    this.addEntity(new Cube(5, -2, 0, "Ground"));
    this.addEntity(new Cube(-5, 2, 0, "Ground"));
    this.addEntity(new Cube(0, -3, 0, "Ground"));
    this.addEntity(new Cube(0, 5, 0, "Ground"));

    this.addEntity(new Cube(0, 6, 0, "Coin"));
    this.addEntity(new Cube(0, -2, 0, "Coin"));
  }
}
