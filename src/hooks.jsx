import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

export function Reveal({ children, delay = 0, from = "up", className = "" }) {
  const [ref, seen] = useInView(0.15);
  return (
    <div ref={ref} style={{ "--d": `${delay}ms` }} className={`reveal ${from === "up" ? "" : from} ${seen ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Counter({ to, suffix = "" }) {
  const [ref, seen] = useInView(0.5);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf, t0;
    const step = (t) => {
      t0 ??= t;
      const p = Math.min((t - t0) / 1800, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}
