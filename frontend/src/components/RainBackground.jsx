import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

// Novo componente visual de fundo para a Home.
// Ele desenha chuva em canvas e opcionalmente flashes de raio.
export function RainBackground({
  className,
  children,
  count = 150,
  intensity = 1,
  angle = 15,
  color = "rgba(174, 194, 224, 0.5)",
  lightning = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const flash = flashRef.current;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    canvas.width = width;
    canvas.height = height;

    let animationId;
    const totalDrops = Math.floor(count * intensity);
    const angleRad = (angle * Math.PI) / 180;

    // Cada gota nasce em uma das 3 camadas de profundidade,
    // o que muda velocidade, tamanho e opacidade.
    const createDrop = (layer) => {
      const layerConfig = [
        { speed: 12, length: 15, opacity: 0.2 },
        { speed: 18, length: 20, opacity: 0.35 },
        { speed: 25, length: 28, opacity: 0.5 },
      ][layer];

      return {
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * height - height,
        length: layerConfig.length + Math.random() * 10,
        speed: layerConfig.speed + Math.random() * 5,
        opacity: layerConfig.opacity + Math.random() * 0.1,
        layer,
      };
    };

    const drops = [];
    for (let index = 0; index < totalDrops; index += 1) {
      const layer = index < totalDrops * 0.3 ? 0 : index < totalDrops * 0.6 ? 1 : 2;
      drops.push(createDrop(layer));
    }

    let nextLightning = Date.now() + 3000 + Math.random() * 5000;

    // Flash curto para simular relampago quando a opcao estiver ativa.
    const triggerLightning = () => {
      if (!flash) return;
      flash.style.opacity = "0.8";
      window.setTimeout(() => {
        if (flash) flash.style.opacity = "0.3";
      }, 50);
      window.setTimeout(() => {
        if (flash) flash.style.opacity = "0";
      }, 150);
      nextLightning = Date.now() + 3000 + Math.random() * 5000;
    };

    // Mantem o canvas sincronizado com o tamanho real do container.
    const handleResize = () => {
      const nextRect = container.getBoundingClientRect();
      width = nextRect.width;
      height = nextRect.height;
      canvas.width = width;
      canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Loop principal que limpa o canvas, move as gotas e redesenha tudo.
    const animate = () => {
      context.clearRect(0, 0, width, height);

      if (lightning && Date.now() > nextLightning) {
        triggerLightning();
      }

      context.strokeStyle = color;
      context.lineCap = "round";

      for (const drop of drops) {
        drop.y += drop.speed;
        drop.x += Math.sin(angleRad) * drop.speed;

        if (drop.y > height + 50) {
          drop.y = -drop.length - Math.random() * 100;
          drop.x = Math.random() * (width + 100) - 50;
        }

        context.globalAlpha = drop.opacity;
        context.lineWidth = drop.layer === 2 ? 1.5 : drop.layer === 1 ? 1 : 0.5;
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(
          drop.x + Math.sin(angleRad) * drop.length,
          drop.y + Math.cos(angleRad) * drop.length
        );
        context.stroke();
      }

      context.globalAlpha = 1;
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [count, intensity, angle, color, lightning]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: "linear-gradient(to bottom, #0c1018 0%, #1a1f2e 50%, #151922 100%)",
      }}
    >
      {/* Canvas principal onde a chuva é desenhada */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Camada opcional para piscadas de relampago */}
      {lightning && (
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-blue-100 opacity-0 transition-opacity duration-100"
        />
      )}

      {/* Neblina/escurecimento no rodape do fundo */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(20, 25, 35, 0.8) 0%, transparent 100%)",
        }}
      />

      {/* Vinheta para fechar as bordas e concentrar o olhar no conteudo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(8,10,15,0.7) 100%)",
        }}
      />

      {/* Conteudo da pagina continua por cima do background */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

export default RainBackground;
