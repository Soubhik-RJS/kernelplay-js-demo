import { AnimatorController } from "kernelplay-js";
import { idleDown, idleRight, idleUp, idleLeft, walkClipDown, walkClipUp, walkClipRight, walkClipLeft } from "../clips/player_clips.js";

export function PlayerAnimatorController() {

    return new AnimatorController()

        // --- PARAMETERS ---
        .addParameter("speedX", "float", 0)
        .addParameter("speedY", "float", 0)
        .addParameter("isAttacking", "bool", false)

        // --- STATES ---
        .addState("idleDown", idleDown)
        .addState("idleUp", idleUp)
        .addState("idleRight", idleRight)
        .addState("idleLeft", idleLeft)
        .addState("walkDown", walkClipDown)
        .addState("walkUp", walkClipUp)
        .addState("walkRight", walkClipRight)
        .addState("walkLeft", walkClipLeft)

        // --- TRANSITIONS: WALK -> IDLE ---
        .addTransition("walkRight", "idleRight", {
            conditions: [{ param: "speedX", op: "<=", value: 0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkLeft", "idleLeft", {
            conditions: [{ param: "speedX", op: ">=", value: -0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkDown", "idleDown", {
            conditions: [{ param: "speedY", op: "<=", value: 0.1 }],
            hasExitTime: false, duration: 0
        })
        .addTransition("walkUp", "idleUp", {
            conditions: [{ param: "speedY", op: ">=", value: -0.1 }],
            hasExitTime: false, duration: 0
        })

        // --- TRANSITIONS: IDLE -> WALK ---
        .addTransition("idleDown", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleUp", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleLeft", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleRight", "walkRight", { conditions: [{ param: "speedX", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 2 })

        .addTransition("idleDown", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleUp", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleLeft", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })
        .addTransition("idleRight", "walkLeft", { conditions: [{ param: "speedX", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 2 })

        .addTransition("idleDown", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleUp", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleLeft", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleRight", "walkDown", { conditions: [{ param: "speedY", op: ">", value: 0.1 }], hasExitTime: false, duration: 0, priority: 1 })

        .addTransition("idleDown", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleUp", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleLeft", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
        .addTransition("idleRight", "walkUp", { conditions: [{ param: "speedY", op: "<", value: -0.1 }], hasExitTime: false, duration: 0, priority: 1 })
}