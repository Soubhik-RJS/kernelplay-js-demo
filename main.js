import { Game } from "kernelplay-js";
import { Level1 } from "./scenes/Level1.js";

class MyGame extends Game {
  init() {
    this.sceneManager.addScene(new Level1("Level1"));
    this.sceneManager.startScene("Level1");
  }
}

const game = new MyGame({
  width: 800,
  height: 600,
  fps: 60
});

game.start();
