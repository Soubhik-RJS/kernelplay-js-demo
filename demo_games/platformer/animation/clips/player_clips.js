import { AnimationClip } from "kernelplay-js";

export const idleClip = new AnimationClip({
    name: "idle",
    frames: [0, 2],
    frameRate: 2,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const walkClip = new AnimationClip({
    name: "walk",
    frames: [8, 9, 10, 11],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const jumpClip = new AnimationClip({
    name: "jump",
    frames: [9],
    frameRate: 1,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});