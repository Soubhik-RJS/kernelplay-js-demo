import { AnimatorController } from "kernelplay-js";
import { idleClip, walkClip, jumpClip } from "../clips/player_clips.js"

export function PlayerAnimatorController() { 
    return new AnimatorController()
        .addParameter("speed", "float", 0)
        .addParameter("isGrounded", "bool", false)
        .addParameter("jump", "trigger")

        .addState("idle", idleClip)
        .addState("walk", walkClip)
        .addState("jump", jumpClip)

        // idle → walk: must be moving AND grounded
        .addTransition("idle", "walk", {
            conditions: [
                { param: "speed", op: ">", value: 0.1 },
                { param: "isGrounded", op: "true" },   // ← grounded check
            ],
            hasExitTime: false,
            duration: 0,
        })

        // walk → idle: stopped OR not grounded
        .addTransition("walk", "idle", {
            conditions: [
                { param: "speed", op: "<=", value: 0.1 },
            ],
            hasExitTime: false,
            duration: 0,
        })

        // walk → jump if leaves ground (e.g. walks off a ledge)
        .addTransition("walk", "jump", {
            conditions: [
                { param: "isGrounded", op: "false" },  // ← fell off ledge
            ],
            hasExitTime: false,
            duration: 0,
        })

        // AnyState → jump on trigger
        .addAnyStateTransition("jump", {
            conditions: [{ param: "jump", op: "trigger" }],
            hasExitTime: false,
            priority: 10,
        })

        // jump → idle only when grounded again
        .addTransition("jump", "idle", {
            conditions: [
                { param: "isGrounded", op: "true" },   // ← wait for landing
            ],
            hasExitTime: false,
            duration: 0,
        });

}