import { Game } from "kernelplay-js";
import { Level3 } from "./scenes/Level3.js";
import { ThreeRenderer } from "@kernelplay/three-renderer";

class MyGame extends Game {
    init() {
        this.sceneManager.addScene(new Level3("Level1"));
        this.sceneManager.startScene("Level1");
    }
}

const game = new MyGame({
    renderer: new ThreeRenderer(),
    width: 800,
    height: 600,
    fps: 60
});

game.start();
