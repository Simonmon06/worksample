import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { TopToolBar } from "../components/TopToolBar";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export default function MainView() {
  const [mode, setMode] = useState("default");
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const [isSwiping, setIsSwiping] = useState(false);
  const isSpaces = mode === "mySpaces";

  useEffect(() => {
    if (!isSpaces) setIsSwiping(false); // 退出 mySpaces 时关掉模糊
  }, [isSpaces]);
  // 拉图
  useEffect(() => {
    let alive = true;
    async function fetchPhotos() {
      try {
        const collectionId = "pT24l4gTJP0";
        const res = await axios.get(
          `https://api.unsplash.com/collections/${collectionId}/photos`,
          { params: { per_page: 3, client_id: ACCESS_KEY } }
        );
        const data = res.data || [];
        const srcs = data.map((p) => p.urls.regular);
        if (alive) {
          setPhotos({ srcs });
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (alive) {
          setError("Failed to fetch photos");
          setLoading(false);
        }
      }
    }
    fetchPhotos();
    return () => {
      alive = false;
    };
  }, []);

  // 越界保护
  useEffect(() => {
    const n = photos?.srcs?.length ?? 0;
    if (n && activeIndex > n - 1) setActiveIndex(0);
  }, [photos?.srcs?.length]);

  // 切到 mySpaces 时把 swiper 对齐到当前 index（无动画）
  useEffect(() => {
    if (isSpaces && swiperRef.current) {
      swiperRef.current.slideTo(activeIndex, 0);
      swiperRef.current.update();
    }
  }, [isSpaces, activeIndex]);

  useEffect(() => {
    const sw = swiperRef.current;

    if (!sw) return;

    // ✅ 这些开关需要命令式更新
    sw.allowTouchMove = isSpaces;
    sw.allowSlideNext = isSpaces;
    sw.allowSlidePrev = isSpaces;

    // 同步 params（有些逻辑读取 params）
    // sw.params.allowTouchMove = isSpaces;
    sw.params.centeredSlides = isSpaces;
    sw.params.simulateTouch = true; // 鼠标拖拽需要（默认 true，保险起见）
    sw.params.touchStartPreventDefault = false; // 避免图片阻断

    // 切到 mySpaces 时对齐到当前卡片（无动画），再更新布局
    if (isSpaces) {
      sw.slideTo(activeIndex, 0);
    }
    sw.update();
    console.log("sw: ", sw);
  }, [isSpaces, activeIndex]);

  console.log("isSpaces: ", isSpaces);
  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <div
          className={`relative w-screen h-screen overflow-hidden
              transition-[filter] duration-150
              ${isSpaces && isSwiping ? "blur-[6px]" : "blur-none"}`}
          style={{ willChange: "filter" }}
        >
          <Swiper
            // 同一个 Swiper，按模式切换交互 & 布局
            modules={[]}
            initialSlide={activeIndex}
            onSwiper={(sw) => {
              swiperRef.current = sw;
            }}
            onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
            allowTouchMove={false} // 🚫 default 禁止拖拽
            allowSlideNext={false}
            allowSlidePrev={false}
            centeredSlides={false} // mySpaces 居中+露邻居
            slidesPerView="auto"
            spaceBetween={isSpaces ? 32 : 0}
            speed={400}
            className="w-screen h-screen"
            // blur
            onTouchStart={() => isSpaces && setIsSwiping(true)}
            onSliderMove={() => isSpaces && setIsSwiping(true)}
            onTransitionStart={() => isSpaces && setIsSwiping(true)}
            onTouchEnd={() => setIsSwiping(false)}
            onTransitionEnd={() => setIsSwiping(false)}
          >
            {(photos?.srcs ?? []).map((src, i) => (
              <SwiperSlide
                key={i}
                // default 模式：满屏（看起来像单图）
                // mySpaces 模式：小于 100vw，左右露邻居
                className={
                  isSpaces
                    ? "!w-[88vw] sm:!w-[82vw] md:!w-[76vw] lg:!w-[70vw] !h-full !flex !items-center"
                    : "!w-screen !h-screen !flex !items-center"
                }
              >
                {/* 用 layout 做“尺寸/位置插值动画”：default ↔ mySpaces */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  className={`relative ${
                    isSpaces ? "aspect-[1488/991.2] w-full" : "w-full h-full"
                  } 
                              overflow-hidden rounded-3xl
                              transition-[box-shadow] duration-300
                              ${
                                i === activeIndex && isSpaces
                                  ? "shadow-2xl"
                                  : "shadow-lg"
                              }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    draggable={false}
                    decoding="async"
                    loading={i === activeIndex ? "eager" : "lazy"}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                    }}
                  />
                </motion.div>
              </SwiperSlide>
            ))}

            {/* Add 卡片 */}
            <SwiperSlide
              className={
                isSpaces
                  ? "!w-[50vw] sm:!w-[36vw] lg:!w-[28vw] !h-full !flex !items-center"
                  : "!w-0 !h-0" // default 模式隐藏（不占空间可不加）
              }
            >
              <button
                className="relative aspect-[1488/991.2] w-full grid place-items-center rounded-3xl
                           border-2 border-white/30 bg-white/10 hover:bg-white/20 text-5xl font-medium"
                aria-label="Add new space"
              >
                +
              </button>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <TopToolBar mode={mode} setMode={setMode} />
    </div>
  );
}
