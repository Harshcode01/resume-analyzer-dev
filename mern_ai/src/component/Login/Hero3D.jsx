import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3D({ onScrollProgress }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Atmospheric Fog (ecologie.fr style depth fade)
    const scene = new THREE.Scene();
    const bgColor = 0x050807;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    camera.position.set(0, 3.5, 22);

    // 3. Renderer (capped at 1.5x DPR for 60fps performance)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 4. glowing Sun / Moon Disc at the end of the valley
    const sunGeo = new THREE.CircleGeometry(14, 64);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      fog: false,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 10, -115);
    scene.add(sunMesh);

    // 5. Procedural Silhouette Ridges & Pine Spires (Left & Right Canyon Walls)
    const valleyGroup = new THREE.Group();
    scene.add(valleyGroup);

    const createRidgeGeometry = (side, layerIndex) => {
      const shape = new THREE.Shape();
      const width = 65;
      const steps = 48;

      shape.moveTo(0, -15);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * width;
        // Valley floor stays low near center (t near 0), rises steeply outward
        const valleySlope = Math.pow(t, 1.35) * 22;
        // Organic jagged tree/peak silhouettes
        const jaggedPeak =
          Math.sin(i * 1.7 + layerIndex) * 1.8 +
          Math.cos(i * 3.9 - layerIndex * 2) * 1.1 +
          (i % 2 === 0 ? 1.4 : -0.4);

        const y = Math.max(0.2, valleySlope + jaggedPeak);
        shape.lineTo(x, y);
      }
      shape.lineTo(width, -15);
      shape.closePath();

      const geom = new THREE.ShapeGeometry(shape);
      if (side === "left") {
        geom.scale(-1, 1, 1);
      }
      return geom;
    };

    const totalLayers = 32;
    const disposableGeometries = [sunGeo];
    const disposableMaterials = [sunMat];

    for (let i = 0; i < totalLayers; i++) {
      const z = 12 - i * 3.8; // Recedes from z = 12 back to z = -109
      const progress = i / totalLayers;

      // Foreground silhouettes are pitch black; deeper layers shift to slate/emerald mist
      const layerColor = new THREE.Color().lerpColors(
        new THREE.Color(0x020303),
        new THREE.Color(0x273833),
        Math.pow(progress, 0.85)
      );

      const mat = new THREE.MeshBasicMaterial({
        color: layerColor,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(mat);

      // Left canyon silhouette
      const leftGeo = createRidgeGeometry("left", i);
      const leftMesh = new THREE.Mesh(leftGeo, mat);
      // Leave a central path gap so the camera flies down the middle
      const gapOffset = 2.2 + Math.sin(i * 0.45) * 1.5;
      leftMesh.position.set(-gapOffset, -3.5, z);
      valleyGroup.add(leftMesh);
      disposableGeometries.push(leftGeo);

      // Right canyon silhouette
      const rightGeo = createRidgeGeometry("right", i + 10);
      const rightMesh = new THREE.Mesh(rightGeo, mat);
      rightMesh.position.set(gapOffset, -3.5, z);
      valleyGroup.add(rightMesh);
      disposableGeometries.push(rightGeo);
    }

    // 6. Dark Reflective Valley Floor
    const floorGeo = new THREE.PlaneGeometry(200, 300);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x030504 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -3.6, -60);
    scene.add(floorMesh);
    disposableGeometries.push(floorGeo);
    disposableMaterials.push(floorMat);

    // 7. Floating Atmospheric Spores / Fireflies
    const particleCount = window.innerWidth < 768 ? 150 : 350;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 18 - 2;
      positions[i * 3 + 2] = 18 - Math.random() * 125;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0xd1d5db,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    disposableGeometries.push(particleGeo);
    disposableMaterials.push(particleMat);

    // 8. Scroll & Pointer Interaction State
    let targetZ = 22;
    let currentZ = 22;
    let mouseX = 0;
    let mouseY = 0;

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction =
        maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

      // Pull camera backward (or push forward) through the silhouette valley
      targetZ = 22 - scrollFraction * 75;
      if (onScrollProgress) onScrollProgress(scrollFraction);
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop (Pauses when browser tab is hidden)
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let reqId;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Smooth damped camera flight along Z
      currentZ += (targetZ - currentZ) * 0.06;
      camera.position.z = currentZ;

      if (!prefersReducedMotion) {
        // Subtle mouse parallax
        camera.position.x += (mouseX * 2.2 - camera.position.x) * 0.05;
        camera.position.y += (3.5 - mouseY * 1.1 - camera.position.y) * 0.05;
        particles.rotation.y = elapsed * 0.015;
      }

      camera.lookAt(camera.position.x * 0.35, 2.8, currentZ - 35);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onScrollProgress]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}