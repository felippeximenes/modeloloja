import { useEffect, useRef } from "react";

// Fundo interativo baseado em rastro de cursor.
// A implementação é local e usa canvas 2D para manter o efeito leve no projeto.
export default function GhostCursor({
  className = "",
  trailLength = 35,
  inertia = 0.5,
  grainIntensity = 0.05,
  bloomStrength = 0.1,
  bloomRadius = 1,
  brightness = 2,
  color = "#31b0a9",
  edgeIntensity = 0,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, inside: false });
  const trailRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const handleMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.tx = event.clientX - rect.left;
      mouseRef.current.ty = event.clientY - rect.top;
      mouseRef.current.inside = true;
    };

    const handleLeave = () => {
      mouseRef.current.inside = false;
    };

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);

    // Pequeno gerador de ruído para "grão" visual.
    const drawGrain = () => {
      if (grainIntensity <= 0) return;
      const alpha = Math.min(Math.max(grainIntensity, 0), 1) * 12;

      for (let index = 0; index < 80; index += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        context.fillStyle = `rgba(255,255,255,${alpha / 255})`;
        context.fillRect(x, y, size, size);
      }
    };

    const animate = () => {
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * inertia;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * inertia;

      context.clearRect(0, 0, width, height);

      // Base escura para manter o cursor fantasma legível.
      context.fillStyle = "rgba(6, 8, 14, 0.9)";
      context.fillRect(0, 0, width, height);

      if (mouseRef.current.inside) {
        trailRef.current.unshift({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
        });
      }

      trailRef.current = trailRef.current.slice(0, trailLength);

      trailRef.current.forEach((point, index) => {
        const progress = 1 - index / Math.max(trailLength, 1);
        const radius = 10 + progress * 26 * brightness;
        const alpha = progress * (0.22 + bloomStrength);

        // Bloom principal.
        const gradient = context.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          radius * (1 + bloomRadius)
        );
        gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(0.35, `${color}${Math.round(alpha * 120).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(1, `${color}00`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, radius * (1 + bloomRadius), 0, Math.PI * 2);
        context.fill();

        // Núcleo mais brilhante.
        context.fillStyle = `rgba(49, 176, 169, ${alpha * 0.9})`;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(3, radius * 0.18), 0, Math.PI * 2);
        context.fill();

        // Borda opcional do fantasma.
        if (edgeIntensity > 0) {
          context.strokeStyle = `rgba(255,255,255,${progress * edgeIntensity})`;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(point.x, point.y, radius * 0.42, 0, Math.PI * 2);
          context.stroke();
        }
      });

      drawGrain();
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [
    bloomRadius,
    bloomStrength,
    brightness,
    color,
    edgeIntensity,
    grainIntensity,
    inertia,
    trailLength,
  ]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Canvas principal do efeito fantasma do cursor */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
