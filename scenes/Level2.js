import { Scene } from "kernelplay-js";
import { Player1 } from "../prefabs/Player1.js";
import { Box1 } from "../prefabs/Box1.js";

export class Level2 extends Scene {
  init() {
    this.addEntity(new Player1(400, 100));
    
        this.addEntity(new Box1(400, 300, "Wall"));
        this.addEntity(new Box1(650, 370, "Wall"));
        this.addEntity(new Box1(650, 170, "Wall"));
        this.addEntity(new Box1(150, 170, "Wall"));
        this.addEntity(new Box1(150, 360, "Wall"));
    
        this.addEntity(new Box1(650, 120, "Coin"));
        this.addEntity(new Box1(150, 315, "Coin"));
  }
}
