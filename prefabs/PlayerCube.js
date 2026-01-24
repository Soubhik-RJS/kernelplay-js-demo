import * as THREE from "three";
import { Entity, ColliderComponent } from "kernelplay-js";
import { CubeScript } from "../scripts/CubeScript.js";

import { Layers } from "kernelplay-js";

import { MeshComponent } from "kernelplay-js";
import { BoxCollider3D } from "kernelplay-js";
import { TransformComponent } from "kernelplay-js";
import { RigidbodyComponent } from "kernelplay-js";

export function PlayerCube(x, y, z = 0) {
  const e = new Entity("Player");
  e.layer = Layers.Player;

  e.addComponent("transform", new TransformComponent({
    position: { x, y, z},
    scale: { x: 1, y: 1, z: 1}
  }));

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "blue" })
  );

  e.addComponent("mesh", new MeshComponent(mesh));
  e.addComponent("collider3D", new BoxCollider3D());
  e.addComponent("rigidbody", new RigidbodyComponent({
    useGravity: false
  }));
  e.addComponent("CubeScript", new CubeScript());

  return e;
}
