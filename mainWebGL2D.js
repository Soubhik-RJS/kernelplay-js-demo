import { Game } from "kernelplay-js";
import { Level2 } from "./scenes/Level2.js";
import { WebGL2DRenderer } from "@kernelplay/pixi-renderer";

class MyGame extends Game {
    init() {
        this.sceneManager.addScene(new Level2("Level1"));
        this.sceneManager.startScene("Level1");
    }
}

const game = new MyGame({
    renderer: new WebGL2DRenderer(),
    width: 800,
    height: 600,
    fps: 60
});

game.start();
