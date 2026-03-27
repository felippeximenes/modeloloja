import { useCallback, useEffect, useRef } from "react";

// Converte a cor hexadecimal para rgba para reutilizar a mesma cor
// nos brilhos e camadas de blur do efeito.
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;

  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const parsed = parseInt(normalized, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function ElectricBorder({
  children,
  color = "#31b0a9",
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  className = "",
  style,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Pequenas funções utilitárias de ruído para deformar o traço
  // da borda e dar o aspecto "elétrico".
  const random = useCallback((value) => {
    return (Math.sin(value * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x, y) => {
      const baseX = Math.floor(x);
      const baseY = Math.floor(y);
      const fracX = x - baseX;
      const fracY = y - baseY;

      const a = random(baseX + baseY * 57);
      const b = random(baseX + 1 + baseY * 57);
      const c = random(baseX + (baseY + 1) * 57);
      const d = random(baseX + 1 + (baseY + 1) * 57);

      const smoothX = fracX * fracX * (3 - 2 * fracX);
      const smoothY = fracY * fracY * (3 - 2 * fracY);

      return (
        a * (1 - smoothX) * (1 - smoothY) +
        b * smoothX * (1 - smoothY) +
        c * (1 - smoothX) * smoothY +
        d * smoothX * smoothY
      );
    },
    [random]
  );

  const octavedNoise = useCallback(
    (x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed, flatness) => {
      let total = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let octave = 0; octave < octaves; octave += 1) {
        let octaveAmplitude = amplitude;
        if (octave === 0) octaveAmplitude *= flatness;

        total +=
          octaveAmplitude *
          noise2D(frequency * x + seed * 100, time * frequency * 0.3);

        frequency *= lacunarity;
        amplitude *= gain;
      }

      return total;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback((centerX, centerY, radius, startAngle, arcLength, progress) => {
    const angle = startAngle + progress * arcLength;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }, []);

  const getRoundedRectPoint = useCallback(
    (progress, left, top, width, height, radius) => {
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = progress * totalPerimeter;

      let accumulated = 0;

      if (distance <= accumulated + straightWidth) {
        const local = (distance - accumulated) / straightWidth;
        return { x: left + radius + local * straightWidth, y: top };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        return getCornerPoint(
          left + width - radius,
          top + radius,
          radius,
          -Math.PI / 2,
          Math.PI / 2,
          (distance - accumulated) / cornerArc
        );
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const local = (distance - accumulated) / straightHeight;
        return { x: left + width, y: top + radius + local * straightHeight };
      }
      accumulated += straightHeight;

      if (distance <= accumulated + cornerArc) {
        return getCornerPoint(
          left + width - radius,
          top + height - radius,
          radius,
          0,
          Math.PI / 2,
          (distance - accumulated) / cornerArc
        );
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightWidth) {
        const local = (distance - accumulated) / straightWidth;
        return { x: left + width - radius - local * straightWidth, y: top + height };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        return getCornerPoint(
          left + radius,
          top + height - radius,
          radius,
          Math.PI / 2,
          Math.PI / 2,
          (distance - accumulated) / cornerArc
        );
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const local = (distance - accumulated) / straightHeight;
        return { x: left, y: top + height - radius - local * straightHeight };
      }
      accumulated += straightHeight;

      return getCornerPoint(
        left + radius,
        top + radius,
        radius,
        Math.PI,
        Math.PI / 2,
        (distance - accumulated) / cornerArc
      );
    },
    [getCornerPoint]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const octaves = 10;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = chaos;
    const frequency = 10;
    const flatness = 0;
    // Valores reduzidos para a borda seguir mais de perto o card
    // e evitar folga visual excessiva acima/abaixo do componente.
    const displacement = 18;
    const borderOffset = 20;

    // O canvas é desenhado maior que o card para que o brilho e as
    // distorções da borda possam "respirar" para fora do componente.
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width + borderOffset * 2;
      const height = rect.height + borderOffset * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      return { width, height, dpr };
    };

    let { width, height } = updateSize();

    // Loop principal: redesenha continuamente a linha distorcida
    // ao redor do retângulo arredondado.
    const draw = (currentTime) => {
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(dpr, dpr);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.lineCap = "round";
      context.lineJoin = "round";

      const left = borderOffset;
      const top = borderOffset;
      const innerWidth = width - 2 * borderOffset;
      const innerHeight = height - 2 * borderOffset;
      const radius = Math.min(borderRadius, Math.min(innerWidth, innerHeight) / 2);
      const approximatePerimeter = 2 * (innerWidth + innerHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.floor(approximatePerimeter / 2);

      context.beginPath();
      // Desloca o ponto de fechamento do loop para longe da lateral esquerda,
      // evitando a pequena emenda visível no topo e na base do card.
      const seamOffset = 0.38;

      for (let index = 0; index <= sampleCount; index += 1) {
        const progress = index / sampleCount;
        const adjustedProgress = (progress + seamOffset) % 1;
        const point = getRoundedRectPoint(
          adjustedProgress,
          left,
          top,
          innerWidth,
          innerHeight,
          radius
        );
        const xNoise = octavedNoise(
          adjustedProgress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          0,
          flatness
        );
        const yNoise = octavedNoise(
          adjustedProgress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          1,
          flatness
        );

        const displacedX = point.x + xNoise * displacement;
        const displacedY = point.y + yNoise * displacement;

        if (index === 0) {
          context.moveTo(displacedX, displacedY);
        } else {
          context.lineTo(displacedX, displacedY);
        }
      }

      context.closePath();
      context.stroke();
      animationRef.current = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      const nextSize = updateSize();
      width = nextSize.width;
      height = nextSize.height;
    });

    resizeObserver.observe(container);
    animationRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [borderRadius, chaos, color, getRoundedRectPoint, octavedNoise, speed]);

  return (
    <div
      ref={containerRef}
      className={`relative isolate overflow-visible ${className}`}
      style={{ borderRadius, ...style }}
    >
      {/* Canvas com a linha animada principal da borda elétrica */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Camadas extras de brilho para reforçar o efeito neon ao redor do card */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]">
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{ border: `2px solid ${hexToRgba(color, 0.6)}`, filter: "blur(1px)" }}
        />
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{ border: `2px solid ${color}`, filter: "blur(4px)" }}
        />
        <div
          className="absolute inset-0 -z-[1] scale-110 rounded-[inherit] opacity-30"
          style={{
            filter: "blur(32px)",
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
          }}
        />
      </div>

      {/* Conteúdo real do card que fica encapsulado dentro da borda */}
      <div className="relative z-[1] rounded-[inherit]">{children}</div>
    </div>
  );
}
