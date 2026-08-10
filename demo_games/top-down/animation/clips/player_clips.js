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

export const idleDown = new AnimationClip({ name: "idleDown", frames: [0], frameRate: 1, loop: true, gridWidth: 4, frameWidth: 64, frameHeight: 64 });
export const idleRight = new AnimationClip({ name: "idleRight", frames: [8], frameRate: 1, loop: true, gridWidth: 4, frameWidth: 64, frameHeight: 64 });
export const idleUp = new AnimationClip({ name: "idleUp", frames: [12], frameRate: 1, loop: true, gridWidth: 4, frameWidth: 64, frameHeight: 64 });
export const idleLeft = new AnimationClip({ name: "idleLeft", frames: [4], frameRate: 1, loop: true, gridWidth: 4, frameWidth: 64, frameHeight: 64 });


export const walkClip = new AnimationClip({
    name: "walk",
    frames: [8, 9, 10, 11],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const walkClipDown = new AnimationClip({
    name: "walkDown",
    frames: [1, 2, 3],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const walkClipRight = new AnimationClip({
    name: "walkRight",
    frames: [9, 10, 11],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const walkClipLeft = new AnimationClip({
    name: "walkLeft",
    frames: [5, 6, 7],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});

export const walkClipUp = new AnimationClip({
    name: "walkUp",
    frames: [13, 14, 15],
    frameRate: 6,
    loop: true,
    gridWidth: 4,
    frameWidth: 64,
    frameHeight: 64,
});
