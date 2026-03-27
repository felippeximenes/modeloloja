import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "../lib/utils";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "49, 176, 169";
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const element = document.createElement("div");
  element.className = "magic-bento-particle";
  element.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 60;
    left: ${x}px;
    top: ${y}px;
  `;
  return element;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.8,
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--magic-glow-x", `${relativeX}%`);
  card.style.setProperty("--magic-glow-y", `${relativeY}%`);
  card.style.setProperty("--magic-glow-intensity", String(glow));
  card.style.setProperty("--magic-glow-radius", `${radius}px`);
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Camada global de spotlight: ilumina os cards próximos ao cursor.
function GlobalSpotlight({
  containerRef,
  disabled = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) {
  const spotlightRef = useRef(null);

  useEffect(() => {
    if (disabled || !enabled || !containerRef.current) return undefined;

    const spotlight = document.createElement("div");
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 9999px;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.14) 0%,
        rgba(${glowColor}, 0.08) 18%,
        rgba(${glowColor}, 0.04) 30%,
        rgba(${glowColor}, 0.02) 45%,
        transparent 72%);
      z-index: 40;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;

    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (event) => {
      if (!containerRef.current || !spotlightRef.current) return;

      const sectionRect = containerRef.current.getBoundingClientRect();
      const inside =
        event.clientX >= sectionRect.left &&
        event.clientX <= sectionRect.right &&
        event.clientY >= sectionRect.top &&
        event.clientY <= sectionRect.bottom;

      const cards = containerRef.current.querySelectorAll(".magic-bento-card");

      if (!inside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });
        cards.forEach((card) => card.style.setProperty("--magic-glow-intensity", "0"));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance =
          Math.hypot(event.clientX - centerX, event.clientY - centerY) -
          Math.max(rect.width, rect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(card, event.clientX, event.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: event.clientX,
        top: event.clientY,
        duration: 0.12,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.85
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.85
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      if (!spotlightRef.current || !containerRef.current) return;
      containerRef.current
        .querySelectorAll(".magic-bento-card")
        .forEach((card) => card.style.setProperty("--magic-glow-intensity", "0"));
      gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [containerRef, disabled, enabled, glowColor, spotlightRadius]);

  return null;
}

// Card individual com tilt, partículas e click ripple.
export function MagicBentoCard({
  children,
  className = "",
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false,
  clickEffect = true,
  enableMagnetism = false,
  enableStars = true,
  enableBorderGlow = true,
}) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [glowColor, particleCount]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: "back.in(1.7)",
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || !enableStars) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 70,
          y: (Math.random() - 0.5) * 70,
          rotation: Math.random() * 360,
          duration: 2 + Math.random(),
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.25,
          duration: 1.4,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 80);

      timeoutsRef.current.push(timeoutId);
    });
  }, [enableStars, initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return undefined;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.25,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.25, ease: "power2.out" });
      }

      if (enableMagnetism) {
        gsap.to(element, { x: 0, y: 0, duration: 0.25, ease: "power2.out" });
      }
    };

    const handleMouseMove = (event) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(element, {
          x: (x - centerX) * 0.04,
          y: (y - centerY) * 0.04,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (event) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 9999px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.32) 0%, rgba(${glowColor}, 0.14) 32%, transparent 72%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 70;
      `;

      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    clickEffect,
    disableAnimations,
    enableMagnetism,
    enableTilt,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "magic-bento-card relative overflow-hidden rounded-[inherit] transition-transform duration-300",
        enableBorderGlow && "magic-bento-border-glow",
        className
      )}
      style={{
        "--magic-glow-x": "50%",
        "--magic-glow-y": "50%",
        "--magic-glow-intensity": "0",
        "--magic-glow-radius": "200px",
      }}
    >
      {children}
    </div>
  );
}

// Container principal: injeta variáveis CSS e spotlight compartilhado.
export default function MagicBento({
  children,
  className = "",
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  disableAnimations = false,
}) {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  const styleVars = useMemo(
    () => ({
      "--magic-glow-color": glowColor,
    }),
    [glowColor]
  );

  return (
    <>
      <style>
        {`
          .magic-bento-root {
            --magic-glow-x: 50%;
            --magic-glow-y: 50%;
            --magic-glow-intensity: 0;
            --magic-glow-radius: 300px;
          }

          .magic-bento-border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 3px;
            border-radius: inherit;
            background: radial-gradient(
              var(--magic-glow-radius) circle at var(--magic-glow-x) var(--magic-glow-y),
              rgba(var(--magic-glow-color), calc(var(--magic-glow-intensity) * 0.72)) 0%,
              rgba(var(--magic-glow-color), calc(var(--magic-glow-intensity) * 0.28)) 28%,
              transparent 62%
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
          }

          .magic-bento-particle::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 9999px;
            background: rgba(var(--magic-glow-color), 0.18);
            z-index: -1;
          }

          ${textAutoHide ? `
          .magic-bento-root .text-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
          }
          .magic-bento-root .text-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }` : ""}
        `}
      </style>

      <GlobalSpotlight
        containerRef={gridRef}
        disabled={shouldDisableAnimations}
        enabled={enableSpotlight}
        spotlightRadius={spotlightRadius}
        glowColor={glowColor}
      />

      <div
        ref={gridRef}
        className={cn("magic-bento-root relative", className)}
        style={styleVars}
        data-stars={enableStars}
        data-border-glow={enableBorderGlow}
        data-tilt={enableTilt}
        data-magnetism={enableMagnetism}
        data-click-effect={clickEffect}
        data-particle-count={particleCount}
      >
        {children}
      </div>
    </>
  );
}
