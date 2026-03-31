import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const springValues = {
  damping: 26,
  stiffness: 120,
  mass: 1.8,
};

export default function TiltedCard({
  children,
  className = "",
  captionText = "",
  containerHeight = "100%",
  containerWidth = "100%",
  scaleOnHover = 1.03,
  rotateAmplitude = 7,
  showTooltip = false,
  showMobileWarning = false,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, springValues);
  const rotateY = useSpring(0, springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0, { damping: 24, stiffness: 180 });
  const rotateFigcaption = useSpring(0, {
    stiffness: 260,
    damping: 24,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);

  function handleMouse(event) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(event.clientX - rect.left + 12);
    y.set(event.clientY - rect.top - 14);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.28);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className={`relative m-0 w-full h-full overflow-hidden [perspective:900px] ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-3 left-3 text-center text-xs text-white/70 block sm:hidden">
          Efeito otimizado para desktop.
        </div>
      )}

      {/* O tilt é aplicado ao card inteiro para manter a UI coesa. */}
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-[inherit] [transform-style:preserve-3d] [backface-visibility:hidden]"
        style={{ rotateX, rotateY, scale }}
      >
        <div className="h-full w-full overflow-hidden rounded-[inherit] [transform:translateZ(0)] [backface-visibility:hidden] will-change-transform">
          {children}
        </div>
      </motion.div>

      {showTooltip && captionText && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 hidden rounded-md border border-white/15 bg-slate-950/90 px-3 py-1 text-[11px] font-medium text-white shadow-lg sm:block"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
