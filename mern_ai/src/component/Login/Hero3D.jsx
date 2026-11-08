import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Tuning knobs
const ENV_INTENSITY = 0.55; // glossy reflections strength
const SAFE_PAD = 0.04; // extra breathing room around the hero copy
const CURSOR_LIGHT = 45; // brightness of the light that follows the cursor

export default function Hero3D({ scrollProgressRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const disposableGeometries = [];
    const disposableMaterials = [];

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    camera.position.set(0, 0, 18);

    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL: violet glow instead of the 3D scene
      container.style.mixBlendMode = "screen";
      container.style.background =
        "radial-gradient(60% 50% at 50% 45%, rgba(124,92,255,0.35), transparent 70%)";
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Studio reflections (makes the clearcoat look glossy instead of flat)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;
    if ("environmentIntensity" in scene) {
      scene.environmentIntensity = ENV_INTENSITY;
    }

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(12, 18, 16);
    scene.add(keyLight);

    const blueRimLight = new THREE.PointLight(0x0044ff, 10, 45);
    blueRimLight.position.set(-10, -6, 8);
    scene.add(blueRimLight);

    const magentaTunnelLight = new THREE.PointLight(0xff007f, 0, 60);
    magentaTunnelLight.position.set(0, 0, -30);
    scene.add(magentaTunnelLight);

    const cursorLight = new THREE.PointLight(0xb9a8ff, 0, 40);
    scene.add(cursorLight);
    let pointerSeen = false;

    // -----------------------------------------------------------------
    // Responsive layout: crosses are placed in normalized screen space
    // (u, v in -1..1) and kept OUT of an ellipse around the hero copy,
    // the header and the bottom bar. The sign up button is never covered.
    // -----------------------------------------------------------------
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const view = { halfW: 1, halfH: 1 };
    const safeZone = { ru: 0.64, rv: 0.4, cy: 0.04 };

    const updateView = () => {
      const aspect = window.innerWidth / window.innerHeight;
      view.halfH = tanHalfFov * camera.position.z;
      view.halfW = view.halfH * aspect;
      // Wide screens: copy is a centered block. Tall screens: copy spans
      // the full width, so crosses live only in the top and bottom bands.
      safeZone.ru = THREE.MathUtils.clamp(
        0.64 + (1.2 - aspect) * 0.72,
        0.64,
        1.15
      );
      safeZone.rv = aspect < 0.8 ? 0.3 : 0.4;
    };
    updateView();

    const inSafeZone = (u, v, pad = 0) => {
      const du = u / (safeZone.ru + pad);
      const dv = (v - safeZone.cy) / (safeZone.rv + pad);
      return du * du + dv * dv < 1;
    };

    // WORLD A: Glossy Crosses Pit
    const crossesGroup = new THREE.Group();
    scene.add(crossesGroup);

    const armGeo = new THREE.CylinderGeometry(0.46, 0.46, 2.75, 24);
    const capGeo = new THREE.SphereGeometry(0.46, 24, 16);
    disposableGeometries.push(armGeo, capGeo);

    const buildRoundedAxis = (rotX, rotZ, mat) => {
      const axisGroup = new THREE.Group();
      const cyl = new THREE.Mesh(armGeo, mat);
      const topCap = new THREE.Mesh(capGeo, mat);
      topCap.position.y = 1.375;
      const botCap = new THREE.Mesh(capGeo, mat);
      botCap.position.y = -1.375;
      axisGroup.add(cyl, topCap, botCap);
      axisGroup.rotation.set(rotX, 0, rotZ);
      return axisGroup;
    };

    const palette = [
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05,
        clearcoat: 1.0,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x0038ff,
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 1.0,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x0d0f14,
        roughness: 0.15,
        metalness: 0.4,
        clearcoat: 1.0,
      }),
    ];
    palette.forEach((m) => disposableMaterials.push(m));

    const crossItems = [];
    const crossCount = window.innerWidth < 768 ? 14 : 24;

    // Pick a spot outside the safe zone, header band and bottom bar,
    // and not too close to another cross.
    const placeItem = (item, others) => {
      let best = null;
      for (let t = 0; t < 60; t++) {
        const u = (Math.random() * 2 - 1) * 1.04;
        const v = -0.92 + Math.random() * (0.8 + 0.92); // -0.92 .. 0.80
        if (inSafeZone(u, v, SAFE_PAD)) continue;
        best = { u, v };
        let clear = true;
        for (let j = 0; j < others.length; j++) {
          const o = others[j];
          if (o === item || o.u === undefined) continue;
          const dx = (u - o.u) * view.halfW;
          const dy = (v - o.v) * view.halfH;
          if (dx * dx + dy * dy < 2.4 * 2.4) {
            clear = false;
            break;
          }
        }
        if (clear) break;
      }
      if (!best) best = { u: 1, v: -0.8 };
      item.u = best.u;
      item.v = best.v;
    };

    const applyHome = (item) => {
      item.k = (camera.position.z - item.depth) / camera.position.z;
      item.home.set(
        item.u * view.halfW * item.k,
        item.v * view.halfH * item.k,
        item.depth
      );
    };

    for (let i = 0; i < crossCount; i++) {
      const mat = palette[i % palette.length];
      const crossMesh = new THREE.Group();
      crossMesh.add(
        buildRoundedAxis(0, 0, mat),
        buildRoundedAxis(0, Math.PI / 2, mat),
        buildRoundedAxis(Math.PI / 2, 0, mat)
      );

      const scale = 0.8 + (i % 3) * 0.16;
      crossMesh.scale.setScalar(scale);

      const item = {
        mesh: crossMesh,
        home: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        depth: (Math.random() - 0.5) * 5,
        u: undefined,
        v: undefined,
        k: 1,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      };
      placeItem(item, crossItems);
      applyHome(item);
      crossMesh.position.copy(item.home);
      crossesGroup.add(crossMesh);
      crossItems.push(item);
    }

    // WORLD B: Snaking Cobalt Tube Ribbon
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 7, -3),
      new THREE.Vector3(-5, 2, -2),
      new THREE.Vector3(5, -3, -3),
      new THREE.Vector3(-4, -9, -2),
      new THREE.Vector3(7, -16, -4),
      new THREE.Vector3(0, -24, -3),
    ]);
    const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 100, 0.48, 20, false);
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0038ff,
      roughness: 0.18,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(ribbonMesh);
    disposableGeometries.push(ribbonGeo);
    disposableMaterials.push(ribbonMat);
    const ribbonBlue = new THREE.Color(0x0038ff);
    const ribbonTeal = new THREE.Color(0x2ce5d0);

    // WORLD C: Space Portal & Tesseract Tunnel
    const portalGroup = new THREE.Group();
    portalGroup.visible = false;
    scene.add(portalGroup);

    const travelerGroup = new THREE.Group();
    portalGroup.add(travelerGroup);

    const visorGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x020305,
      metalness: 0.95,
      roughness: 0.05,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.75, 0.25);

    const helmetGeo = new THREE.SphereGeometry(0.98, 32, 32);
    const suitMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6fb,
      roughness: 0.22,
      metalness: 0.1,
    });
    const helmetMesh = new THREE.Mesh(helmetGeo, suitMat);
    helmetMesh.position.set(0, 0.75, 0);

    const torsoGeo = new THREE.CapsuleGeometry(0.78, 1.2, 16, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    torsoMesh.position.set(0, -0.9, 0);

    const armLimbGeo = new THREE.CapsuleGeometry(0.26, 0.95, 12, 16);
    const leftArm = new THREE.Mesh(armLimbGeo, suitMat);
    leftArm.position.set(-1.3, -0.35, 0.3);
    leftArm.rotation.set(0.4, 0, 0.85);

    const rightArm = new THREE.Mesh(armLimbGeo, suitMat);
    rightArm.position.set(1.3, -0.35, 0.3);
    rightArm.rotation.set(0.4, 0, -0.85);

    travelerGroup.add(helmetMesh, visorMesh, torsoMesh, leftArm, rightArm);
    disposableGeometries.push(visorGeo, helmetGeo, torsoGeo, armLimbGeo);
    disposableMaterials.push(visorMat, suitMat);

    // Instanced Tunnel Shards
    const shardCount = window.innerWidth < 768 ? 200 : 420;
    const shardGeo = new THREE.BoxGeometry(0.16, 0.6, 2.5);
    const shardMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shardInstanced = new THREE.InstancedMesh(
      shardGeo,
      shardMat,
      shardCount
    );
    portalGroup.add(shardInstanced);
    disposableGeometries.push(shardGeo);
    disposableMaterials.push(shardMat);

    const shardData = [];
    const dummy = new THREE.Object3D();
    const shardColor = new THREE.Color();
    const tunnelPalette = [0x00ffcc, 0x0044ff, 0xff007f, 0x39ff14, 0xffffff];

    for (let i = 0; i < shardCount; i++) {
      const lane = i % 4;
      const spread = 3.0 + Math.random() * 5.8;
      const offset = (Math.random() - 0.5) * 12;
      let sx = 0,
        sy = 0;
      if (lane === 0) {
        sx = spread;
        sy = offset;
      } else if (lane === 1) {
        sx = -spread;
        sy = offset;
      } else if (lane === 2) {
        sx = offset;
        sy = spread;
      } else {
        sx = offset;
        sy = -spread;
      }
      const sz = -Math.random() * 120;
      shardData.push({ x: sx, y: sy, z: sz, speed: 0.5 + Math.random() * 0.7 });

      dummy.position.set(sx, sy, sz);
      dummy.updateMatrix();
      shardInstanced.setMatrixAt(i, dummy.matrix);

      shardColor.setHex(tunnelPalette[i % tunnelPalette.length]);
      shardInstanced.setColorAt(i, shardColor);
    }

    // Apply reflection strength to every physical material
    disposableMaterials.forEach((m) => {
      if ("envMapIntensity" in m) m.envMapIntensity = ENV_INTENSITY;
    });

    let mouseX = 0;
    let mouseY = 0;
    const mouseWorld = new THREE.Vector3();

    const handlePointerMove = (e) => {
      pointerSeen = true;
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateView();
      // Re-seat only the crosses that would now sit inside the copy area
      crossItems.forEach((item) => {
        if (inSafeZone(item.u, item.v, SAFE_PAD)) placeItem(item, crossItems);
        applyHome(item);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let reqId;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const p = scrollProgressRef?.current || 0;
      // Cursor position at the z = 0 plane, matches the real screen position
      mouseWorld.set(mouseX * view.halfW, mouseY * view.halfH, 0);
      cursorLight.position.set(mouseWorld.x, mouseWorld.y, 5);
      cursorLight.intensity = THREE.MathUtils.lerp(
        cursorLight.intensity,
        pointerSeen ? CURSOR_LIGHT : 0,
        0.06
      );

      // STAGE 1: Crosses Pit (Smooth Fade Out by p = 0.16)
      if (p < 0.18) {
        crossesGroup.visible = true;
        crossesGroup.position.y = p * 75;
        const fadeAlpha = Math.max(0, 1 - p / 0.15);
        const intro = 1 - Math.pow(1 - Math.min(1, elapsed / 1.6), 4);
        crossesGroup.scale.setScalar(Math.max(0.001, fadeAlpha * intro));

        for (let i = 0; i < crossItems.length; i++) {
          const item = crossItems[i];
          const m = item.mesh;

          if (!prefersReducedMotion) {
            const dx = m.position.x - mouseWorld.x;
            const dy = m.position.y - mouseWorld.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 16 && distSq > 0.001) {
              const force = (1 - distSq / 16) * 0.08;
              item.vel.x += dx * force;
              item.vel.y += dy * force;
            }
          }

          // Never let a cross drift into the hero copy or the sign up button
          const ex =
            m.position.x / (view.halfW * item.k) / (safeZone.ru + SAFE_PAD);
          const ey =
            (m.position.y / (view.halfH * item.k) - safeZone.cy) /
            (safeZone.rv + SAFE_PAD);
          const len = Math.hypot(ex, ey);
          if (len < 1 && len > 0.001) {
            const push = (1 - len) * 0.2;
            item.vel.x += (ex / len) * push;
            item.vel.y += (ey / len) * push;
          }

          item.vel.x += (item.home.x - m.position.x) * 0.04;
          item.vel.y += (item.home.y - m.position.y) * 0.04;
          item.vel.z += (item.home.z - m.position.z) * 0.04;
          item.vel.multiplyScalar(0.85);
          m.position.add(item.vel);
          if (!prefersReducedMotion) {
            m.rotation.x += item.rotSpeed.x;
            m.rotation.y += item.rotSpeed.y;
          }
        }
      } else {
        crossesGroup.visible = false;
      }

      // STAGE 2: Snaking Cobalt Ribbon
      if (p > 0.06 && p < 0.52) {
        ribbonMesh.visible = true;
        const ribbonAlpha =
          p < 0.14
            ? (p - 0.06) / 0.08
            : p > 0.42
            ? 1 - (p - 0.42) / 0.1
            : 1;
        ribbonMat.opacity = Math.max(0, Math.min(0.9, ribbonAlpha));
        ribbonMesh.position.y = (p - 0.16) * 32;
        ribbonMesh.rotation.z = Math.sin(elapsed * 0.5) * 0.07;

        ribbonMat.color.lerp(p > 0.34 ? ribbonTeal : ribbonBlue, 0.08);
      } else {
        ribbonMesh.visible = false;
      }

      // STAGE 3 & 4: Portal & Tesseract Tunnel
      if (p >= 0.45 && p <= 0.95) {
        portalGroup.visible = true;
        const localP = (p - 0.45) / 0.5;

        travelerGroup.position.x = THREE.MathUtils.lerp(
          travelerGroup.position.x,
          mouseX * 1.4,
          0.06
        );
        travelerGroup.position.y = THREE.MathUtils.lerp(
          travelerGroup.position.y,
          Math.sin(elapsed * 2) * 0.3 + mouseY * 0.9,
          0.06
        );

        const scaleCurve =
          localP < 0.32
            ? 1.0 - localP * 1.2
            : localP < 0.68
            ? 0.6
            : 0.6 + (localP - 0.68) * 1.8;
        travelerGroup.scale.setScalar(Math.max(0.42, scaleCurve));

        travelerGroup.rotation.y = mouseX * 0.4 + Math.sin(elapsed) * 0.12;
        leftArm.rotation.x = 0.4 + Math.sin(elapsed * 3) * 0.2;
        rightArm.rotation.x = 0.4 - Math.sin(elapsed * 3) * 0.2;

        const warpSpeed = localP > 0.2 ? 1.6 + localP * 4.8 : 0.12;
        magentaTunnelLight.intensity = localP > 0.2 ? 14 : 2;

        for (let i = 0; i < shardCount; i++) {
          const s = shardData[i];
          s.z += s.speed * warpSpeed;
          if (s.z > 14) s.z = -120;

          dummy.position.set(s.x, s.y, s.z);
          if (localP > 0.45) {
            const angle = elapsed * 0.7 + i * 0.1;
            const radius = 4.0 + (i % 4) * 1.0;
            dummy.position.x = Math.cos(angle) * radius;
            dummy.position.y = Math.sin(angle) * radius;
            dummy.rotation.z = angle;
          } else {
            dummy.rotation.set(0, 0, 0);
          }
          dummy.updateMatrix();
          shardInstanced.setMatrixAt(i, dummy.matrix);
        }
        shardInstanced.instanceMatrix.needsUpdate = true;
      } else {
        portalGroup.visible = false;
      }

      // Nothing on screen (past the tunnel): skip the GPU work
      if (!crossesGroup.visible && !ribbonMesh.visible && !portalGroup.visible) {
        return;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      shardInstanced.dispose();
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      envTexture.dispose();
      pmrem.dispose();
      if (envScene.dispose) envScene.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}

