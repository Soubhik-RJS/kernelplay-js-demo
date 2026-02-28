import * as THREE from "three";
import { Entity, ColliderComponent } from "kernelplay-js";
import { MeshComponent } from "@kernelplay/three-renderer";
import { BoxCollider3D } from "@kernelplay/three-renderer";
import { TransformComponent } from "kernelplay-js";

export function Cube(x, y, z = 0, isTrigger = false) {
  const e = new Entity("Cube");

  e.addComponent("transform", new TransformComponent({
    position: { x, y, z},
    scale: { x: 1, y: 2, z: 3 }
  }));

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "red" })
  );

  e.addComponent("mesh", new MeshComponent(mesh));
  e.addComponent("collider3D", new BoxCollider3D(isTrigger));

  return e;
}
