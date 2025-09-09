import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { TopToolBar } from "../components/TopToolBar";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

console.log("ACCESS_KEY:", ACCESS_KEY);
export default function MainView() {
  const [mode, setMode] = useState("default");
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef(null);
  const photoRefs = useRef([]);

  useEffect(() => {
    let alive = true;
    async function fetchPhotos() {
      try {
        const collectionId = "pT24l4gTJP0";

        const res = await axios.get(
          `https://api.unsplash.com/collections/${collectionId}/photos`,
          {
            params: {
              per_page: 3,
              client_id: ACCESS_KEY,
            },
          }
        );
        const photos = res.data;
        const srcs = photos.map((p) => p.urls.regular);

        if (alive) {
          setPhotos({ srcs });
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchPhotos();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen  text-zinc-100 overflow-hidden">
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="relative w-screen h-screen overflow-hidden"
        >
          {mode === "default" ? (
            // ===== 默认态：同一张图铺满全屏 =====
            photos?.srcs?.[activeIndex] ? (
              <motion.div
                layoutId="stage" // ⭐ 关键：共享元素 ID
                className="absolute inset-0"
                animate={{
                  borderRadius: 0,
                  boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                }}
              >
                <img
                  src={photos.srcs[activeIndex]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-zinc-800/20" />
            )
          ) : (
            // ===== My Spaces：full-bleed 的横向容器 =====
            <div
              ref={railRef}
              className="carousel carousel-center w-screen h-screen
                   items-center overflow-x-auto scroll-smooth
                   snap-x snap-mandatory gap-6 px-6 "
            >
              {photos?.srcs?.map((src, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={i}
                    ref={(el) => (photoRefs.current[i] = el)}
                    className="carousel-item snap-center w-[94vw] md:w-[92vw] lg:w-[90vw] max-w-7xl"
                  >
                    <motion.div
                      // 统一都用 motion.div，只有活动卡片挂 layoutId
                      layoutId={isActive ? "stage" : undefined}
                      className={`aspect-[1488/991.2] w-full overflow-hidden rounded-3xl`}
                      animate={{
                        borderRadius: isActive ? 24 : 24,
                        boxShadow: isActive
                          ? "0px 20px 100px 0px rgba(0,0,0,0.2)"
                          : "0px 10px 40px 0px rgba(0,0,0,0.15)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 40,
                      }}
                      style={{ willChange: "transform" }} // 提前申请合成层，减少闪烁
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager" // 活动画面更顺
                        decoding="async"
                      />
                    </motion.div>
                  </div>
                );
              })}
              {/* 末尾 Add 卡片 */}
              <button
                className="carousel-item snap-center
                     w-[50vw] md:w-[36vw] lg:w-[28vw] max-w-md
                     grid place-items-center rounded-3xl
                     border-2 border-white/30 bg-white/10 hover:bg-white/20 text-5xl font-medium"
                aria-label="Add new space"
              >
                +
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <TopToolBar mode={mode} setMode={setMode} />
    </div>
  );
}
