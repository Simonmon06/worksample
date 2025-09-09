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
  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isSwiping, setIsSwiping] = useState(false);
  const [justAddedIndex, setJustAddedIndex] = useState(null);

  const isSpaces = mode === "mySpaces";

  useEffect(() => {
    if (!isSpaces) setIsSwiping(false); // 退出 mySpaces 时关掉模糊
  }, [isSpaces]);

  // 拉图
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const collectionId = "pT24l4gTJP0";
        const res = await axios.get(
          `https://api.unsplash.com/collections/${collectionId}/photos`,
          { params: { per_page: 3, client_id: ACCESS_KEY } }
        );
        const data = res.data || [];
        const srcs = data.map((p) => p.urls.regular);
        if (alive) setPhotos({ srcs });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 越界保护
  useEffect(
    () => {
      const n = photos?.srcs?.length ?? 0;
      if (n && activeIndex > n - 1) setActiveIndex(0);
    },
    [photos?.srcs?.length]
    // [photos?.srcs?.length, activeIndex]
  );

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

    sw.allowTouchMove = isSpaces;
    sw.allowSlideNext = isSpaces;
    sw.allowSlidePrev = isSpaces;

    // 同步 params（有些逻辑读取 params）
    sw.params.centeredSlides = isSpaces;
    sw.params.simulateTouch = true; // 鼠标拖拽需要（默认 true，保险起见）
    sw.params.touchStartPreventDefault = false; // 避免图片阻断

    if (isSpaces) {
      sw.slideTo(activeIndex, 0);
    }
    sw.updateSlides();
    sw.updateSize();
    sw.update();
  }, [isSpaces, activeIndex]);

  // 选择本地图片并加入
  const handleAddFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许下次选同一文件
    if (!file) return;

    const url = URL.createObjectURL(file);

    // 插到末尾；想插到当前后面可用 activeIndex + 1
    const newIndex = photos?.srcs?.length ?? 0;
    setPhotos((prev) => ({ srcs: [...(prev?.srcs || []), url] }));
    setActiveIndex(newIndex);
    setJustAddedIndex(newIndex); // ⭐ 标记新卡片做动画

    // 等状态进 DOM 后更新并跳到新卡
    requestAnimationFrame(() => {
      const sw = swiperRef.current;
      if (sw) {
        sw.updateSlides();
        sw.updateSize();
        sw.update();
        sw.slideTo(newIndex, 0);
      }
    });
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 flex items-center justify-center">
        <div
          className="w-screen h-screen overflow-hidden"
          style={{
            filter: isSpaces && isSwiping ? "blur(6px)" : "none",
            transition: "filter 150ms",
            willChange: "filter",
          }}
        >
          <Swiper
            // 同一个 Swiper，按模式切换交互 & 布局
            modules={[]}
            initialSlide={activeIndex}
            onSwiper={(sw) => {
              swiperRef.current = sw;
            }}
            onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
            //  default: not allow any move
            allowTouchMove={false}
            allowSlideNext={false}
            allowSlidePrev={false}
            // true in myspace mode to show neighbour and centered
            centeredSlides={false}
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
            {(photos?.srcs ?? []).map((src, i) => {
              const isNew = i === justAddedIndex; // 刚插入的那一张
              return (
                <SwiperSlide
                  key={src}
                  className={
                    isSpaces
                      ? "!w-[88vw] sm:!w-[82vw] md:!w-[76vw] lg:!w-[70vw] !h-full !flex !items-center"
                      : "!w-screen !h-screen !flex !items-center"
                  }
                >
                  <motion.div
                    layout
                    initial={
                      isNew
                        ? {
                            rotate: "-360deg",
                            opacity: 0,
                            scale: 0,
                          }
                        : false
                    }
                    animate={
                      isNew
                        ? {
                            rotate: "0deg",
                            opacity: 1,
                            scale: 1,
                          }
                        : {}
                    }
                    onAnimationComplete={() => {
                      if (isNew) setJustAddedIndex(null);
                    }}
                    transition={
                      isNew
                        ? {
                            type: "spring",
                            stiffness: 200,
                            damping: 30,
                            mass: 0.8,
                          }
                        : { type: "spring", stiffness: 400, damping: 40 }
                    }
                    className={
                      isSpaces
                        ? "aspect-[1488/991.2] w-full rounded-2xl overflow-hidden"
                        : "w-full h-full rounded-2xl overflow-hidden"
                    }
                    style={{ willChange: "transform" }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover select-none"
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
              );
            })}

            {/* Add 卡片 */}
            <SwiperSlide
              className={
                isSpaces
                  ? "!w-[50vw] sm:!w-[36vw] lg:!w-[28vw] !h-full !flex !items-center"
                  : "!hidden" // hide in default mode
              }
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[1488/991.2] w-full grid place-items-center rounded-3xl
                           border-2 border-white/30 bg-white/10 hover:bg-white/20 text-5xl font-medium"
                aria-label="Add new space"
              >
                +
              </button>
            </SwiperSlide>
          </Swiper>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddFile}
          />
        </div>
      </div>

      <TopToolBar mode={mode} setMode={setMode} />
    </div>
  );
}
