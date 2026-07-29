import { useEffect, useRef } from "react";

type TrailPoint = { x: number; y: number; age: number };

export function GlowCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.matchMedia("(pointer: fine)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const points: TrailPoint[] = [];
    const pointer = { x: 0, y: 0, visible: false };
    let frame = 0;
    let previousTime = performance.now();
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.visible = true;
      const last = points.at(-1);
      if (!last || Math.hypot(last.x - pointer.x, last.y - pointer.y) > 3) {
        points.push({ x: pointer.x, y: pointer.y, age: 0 });
      }
      if (points.length > 42) points.shift();
    };
    const onPointerLeave = () => { pointer.visible = false; };
    const draw = (time: number) => {
      const delta = Math.min(time - previousTime, 32);
      previousTime = time;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.globalCompositeOperation = "lighter";
      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        point.age += delta / 950;
        if (point.age >= 1) {
          points.splice(index, 1);
          continue;
        }
        context.beginPath();
        context.arc(point.x, point.y, Math.max(0.7, (1 - point.age) * 3.2), 0, Math.PI * 2);
        context.fillStyle = `rgba(193, 18, 31, ${(1 - point.age) * 0.28})`;
        context.shadowColor = "rgba(193, 18, 31, 0.65)";
        context.shadowBlur = 10;
        context.fill();
      }
      if (pointer.visible) {
        context.beginPath();
        context.arc(pointer.x, pointer.y, 3.5, 0, Math.PI * 2);
        context.fillStyle = "#ff2635";
        context.shadowColor = "rgba(193, 18, 31, 0.95)";
        context.shadowBlur = 16;
        context.fill();
      }
      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(draw);
    };

    document.documentElement.classList.add("custom-cursor-enabled");
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.documentElement.classList.remove("custom-cursor-enabled");
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[11000] h-screen w-screen" aria-hidden />;
}
