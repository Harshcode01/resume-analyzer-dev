import { useEffect, useRef } from "react";

const INTERACTIVE = "button, a, [role='button'], [data-magnetic]";
// Glass cards on the inner pages that get a light spot under the cursor
const SPOT =
  '[class*="cardBlock_"], [class*="diagnosticCard_"], [class*="HistoryCard_"], [class*="AdminCard_"], [class*="statBox_"]';

export default function MagneticCursor() {
  const ringRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!ring || !finePointer) return;

    const follow = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.18;
    let x = -100, y = -100, rx = -100, ry = -100, ox = 0, oy = 0;
    let magnet = null;
    let raf;

    const release = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
      ox = 0;
      oy = 0;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      ring.style.opacity = "1";
      const hit = e.target.closest?.(INTERACTIVE);
      ring.style.width = ring.style.height = hit ? "64px" : "30px";

      const card = e.target.closest?.(SPOT);
      if (card) {
        const cr = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${x - cr.left}px`);
        card.style.setProperty("--my", `${y - cr.top}px`);
      }

      const target = e.target.closest?.("[data-magnetic]");
      if (target !== magnet) release();
      if (target) {
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2 - ox;
        const cy = r.top + r.height / 2 - oy;
        ox = (x - cx) * 0.22;
        oy = (y - cy) * 0.3;
        magnet = target;
        target.style.transition = "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)";
        target.style.transform = `translate(${ox}px, ${oy}px)`;
      }
    };

    const onLeave = () => {
      ring.style.opacity = "0";
      release();
    };

    const tick = () => {
      rx += (x - rx) * follow;
      ry += (y - ry) * follow;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      release();
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "1.5px solid #fff",
        mixBlendMode: "difference",
        pointerEvents: "none",
        zIndex: 100,
        opacity: 0,
        transition: "width .25s ease, height .25s ease, opacity .25s ease",
      }}
    />
  );
}
