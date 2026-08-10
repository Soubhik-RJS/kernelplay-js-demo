import { Game } from "kernelplay-js";
import { Main } from "./scene/Main.js";

class MyGame extends Game {
  init() {
    this.sceneManager.addScene(new Main("Main"));
    this.sceneManager.startScene("Main");
  }
}

const game = new MyGame({ 
  width: 800, 
  height: 600, 
  fps: 60 ,
  // debugPhysics: true,
});

await game.audio.loadAll([
    './assets/jump.mp3',
    './assets/run.mp3',
]);

game.start();