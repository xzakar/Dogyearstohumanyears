"use client";

import { useEffect, useState, useRef } from "react";

const easeOutExpo = (t: number) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function CountUp({
  end,
  duration = 1500,
  className,
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const animationFrameId = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window === 'undefined') {
      return;
    }

    const animate = (timestamp: number) => {
      if (startTime.current === undefined) {
        startTime.current = timestamp;
      }
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.floor(easedProgress * end));

      if (elapsed < duration) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      startTime.current = undefined;
    };
  }, [end, duration]);

  if (typeof window === 'undefined') {
    return <span className={className}>{0}</span>;
  }

  return <span className={className}>{count.toLocaleString()}</span>;
}
