import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

// Counts from 0 to `to`, keeping the decimals of the final value.
export default function CountUp({ to, duration = 1.1 }) {
  const reduce = useReducedMotion();
  const target = Number(to) || 0;
  const decimals = String(to).split(".")[1]?.length || 0;
  const [v, setV] = useState(0);

  useEffect(() => {
    if (reduce) {
      setV(target);
      return;
    }
    const c = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setV,
    });
    return () => c.stop();
  }, [target, duration, reduce]);

  return <>{v.toFixed(decimals)}</>;
}
