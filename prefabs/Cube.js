import * as THREE from "three";
import { Entity, ColliderComponent } from "kernelplay-js";
import { MeshComponent } from "@kernelplay/three-renderer";
import { BoxCollider3D } from "@kernelplay/three-renderer";
import { TransformComponent } from "kernelplay-js";

export function Cube(x, y, z = 0, name = "Ground") {
  const e = new Entity(name);
  e.tag = name.toLowerCase();

  let mesh = 0;

  switch (name) {
    case "Ground":
      e.addComponent("transform", new TransformComponent({
        position: { x, y, z },
        scale: { x: 4, y: 1, z: 4 }
      }));

      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: "#135800" })
      );

      e.addComponent("mesh", new MeshComponent(mesh));
      e.addComponent("collider3D", new BoxCollider3D(false));
      break;

    case "Coin":
      e.addComponent("transform", new TransformComponent({
        position: { x, y, z },
        scale: { x: 0.3, y: 0.3, z: 0.3 }
      }));

      mesh = new THREE.Mesh(
        new THREE.SphereGeometry( 1, 10, 10 ),
        new THREE.MeshStandardMaterial({ color: "#ffea00" })
      );

      e.addComponent("mesh", new MeshComponent(mesh));
      e.addComponent("collider3D", new BoxCollider3D(true));
      break;
  }

  return e;
}
