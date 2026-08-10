import { Scene } from "kernelplay-js";
import { Camera } from "../prefabes/Camera.js";
import { Player } from "../prefabes/Player.js";
import { Platform } from "../prefabes/Platform.js";
 
export class Main extends Scene {
  init() {
    this.addEntity(new Camera(400, 300, this.game.config.width, this.game.config.height));
    this.addEntity(new Player(300, 200));

    this.spawn(Platform, 100, 400);
    this.spawn(Platform, 400, 300);
    this.spawn(Platform, 700, 200);
    this.spawn(Platform, 700, 500);
  }
}