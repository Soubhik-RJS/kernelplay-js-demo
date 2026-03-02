import { Game } from "kernelplay-js";
import { BenchmarkScene } from "./scenes/BenchmarkScene.js";

class MyGame extends Game {
  init() {
    this.sceneManager.addScene(new BenchmarkScene("BenchmarkScene"));
    this.sceneManager.startScene("BenchmarkScene");
  }
}

const game = new MyGame({
  width: 800,
  height: 600,
  fps: 90
});

game.start();
