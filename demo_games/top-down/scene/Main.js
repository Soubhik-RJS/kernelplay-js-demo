import { Scene } from "kernelplay-js";
import { Camera } from "../prefabes/Camera.js";
import { Player } from "../prefabes/Player.js";
import { Object } from "../prefabes/Object.js";
 
export class Main extends Scene {
  init() {
    this.addEntity(new Camera(400, 300, this.game.config.width, this.game.config.height));
    this.addEntity(new Player(400, 200));

    this.spawn(Object, 100, 400, "tree");
    this.spawn(Object, 400, 300, "rock");
    this.spawn(Object, 700, 200, "tree");
    this.spawn(Object, 100, 200, "rock");
    this.spawn(Object, 700, 500, "tree");
  }
}