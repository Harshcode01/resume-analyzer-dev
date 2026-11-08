import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const GLOW = 60; // brightness of the light that follows the cursor

export default function AppBackdrop() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      // No WebGL: violet glow instead of the 3D scene
      el.style.background = "radial-gradient(55% 45% at 70% 30%, rgba(124,92,255,0.28), transparent 70%)";
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.5;
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(8, 12, 10);
    scene.add(key);
    const glow = new THREE.PointLight(0xb9a8ff, 0, 40);
    scene.add(glow);

    const armGeo = new THREE.CylinderGeometry(0.46, 0.46, 2.75, 20);
    const capGeo = new THREE.SphereGeometry(0.46, 20, 12);
    const mats = [0xffffff, 0x0038ff, 0x0d0f14].map(
      (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.12, metalness: 0.1, clearcoat: 1 })
    );
    const axis = (rx, rz, m) => {
      const g = new THREE.Group();
      const arm = new THREE.Mesh(armGeo, m);
      const top = new THREE.Mesh(capGeo, m);
      top.position.y = 1.375;
      const bot = new THREE.Mesh(capGeo, m);
      bot.position.y = -1.375;
      g.add(arm, top, bot);
      g.rotation.set(rx, 0, rz);
      return g;
    };

    const items = [];
    const count = window.innerWidth < 768 ? 5 : 10;
    for (let i = 0; i < count; i++) {
      const m = mats[i % 3];
      const mesh = new THREE.Group();
      mesh.add(axis(0, 0, m), axis(0, Math.PI / 2, m), axis(Math.PI / 2, 0, m));
      mesh.scale.setScalar(0.7 + (i % 3) * 0.18);
      const side = i % 2 ? 1 : -1;
      mesh.position.set(side * (5 + Math.random() * 9), (Math.random() - 0.5) * 14, -4 - Math.random() * 6);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      scene.add(mesh);
      items.push({
        mesh,
        baseY: mesh.position.y,
        phase: Math.random() * 6.28,
        spinX: (Math.random() - 0.5) * 0.006,
        spinY: (Math.random() - 0.5) * 0.006,
      });
    }

    let mx = 0, my = 0, seen = false;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -(e.clientY / window.innerHeight) * 2 + 1;
      seen = true;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (reduce) renderer.render(scene, camera);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      camera.position.x += (mx * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (my * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      glow.position.set(mx * 13, my * 7, -2);
      glow.intensity += ((seen ? GLOW : 0) - glow.intensity) * 0.05;
      for (const it of items) {
        it.mesh.rotation.x += it.spinX;
        it.mesh.rotation.y += it.spinY;
        it.mesh.position.y = it.baseY + Math.sin(t * 0.4 + it.phase) * 0.6;
      }
      renderer.render(scene, camera);
    };
    if (reduce) renderer.render(scene, camera);
    else frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      armGeo.dispose();
      capGeo.dispose();
      mats.forEach((m) => m.dispose());
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", opacity: 0.6 }}
    />
  );
}
