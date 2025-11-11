import { useEffect } from "react";
import { motion, useAnimationControls } from "motion/react";

export function Card({
  src,
  isNew,
  onAnimationComplete,
  isSpaces,
  activeIndex,
  i,
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (isNew) {
      // set the state before entering.
      controls.set({ rotate: -360, scale: 0, opacity: 0 });
      controls
        .start({
          rotate: 0,
          scale: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 200, damping: 30 },
        })
        .then(() => onAnimationComplete?.());
    } else {
      // set defaut state for old card
      controls.set({ rotate: 0, scale: 1, opacity: 1 });
    }
  }, [isNew, controls, onAnimationComplete]);

  return (
    // layout animation
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={isSpaces ? "aspect-[1488/991.2] w-full" : "w-full h-full"}
      style={{ willChange: "transform" }}
    >
      {/* Card layer rounded + rotation (by controls.start) */}
      <motion.div
        animate={controls}
        initial={false}
        className={`w-full h-full overflow-hidden ${
          isSpaces ? "rounded-2xl shadow-2xl" : "rounded-none shadow-none"
        }`}
        style={{ willChange: "transform" }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover select-none"
          draggable={false}
          decoding="async"
          loading={i === activeIndex ? "eager" : "lazy"}
        />
      </motion.div>
    </motion.div>
  );
}
