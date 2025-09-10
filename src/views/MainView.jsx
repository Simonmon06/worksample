import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { TopToolBar } from "../components/TopToolBar";
import { Card } from "../components/Card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { PlusIcon } from "@phosphor-icons/react";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export default function MainView() {
  const [mode, setMode] = useState("default");
  const [photos, setPhotos] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [justAddedIndex, setJustAddedIndex] = useState(null);

  const swiperRef = useRef(null);
  const fileInputRef = useRef(null);

  const isSpaces = mode === "mySpaces";

  useEffect(() => {
    if (!isSpaces) setIsSwiping(false);
  }, [isSpaces]);

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

  // check index out of range
  useEffect(
    () => {
      const n = photos?.srcs?.length ?? 0;
      if (n && activeIndex > n - 1) setActiveIndex(0);
    },
    [photos?.srcs?.length]
    // [photos?.srcs?.length, activeIndex]
  );

  useEffect(() => {
    const sw = swiperRef.current;
    if (!sw) return;

    sw.allowTouchMove = isSpaces;
    sw.allowSlideNext = isSpaces;
    sw.allowSlidePrev = isSpaces;

    // update possible params
    sw.params.centeredSlides = isSpaces;
    sw.params.simulateTouch = true;
    sw.params.touchStartPreventDefault = false;
    sw.slideTo(activeIndex, 0);
    sw.updateSlides();
    sw.updateSize();
    sw.update();
  }, [isSpaces, activeIndex]);

  // add img
  const handleAddFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    const url = URL.createObjectURL(file);

    // add to the end
    const newIndex = photos?.srcs?.length ?? 0;
    setPhotos((prev) => ({ srcs: [...(prev?.srcs || []), url] }));
    setActiveIndex(newIndex);
    setJustAddedIndex(newIndex);
  };

  const atEnd = activeIndex === photos?.srcs?.length - 1;
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
              const isNew = i === justAddedIndex;
              console.log("isNew: ", isNew);
              return (
                <SwiperSlide
                  key={src}
                  className={
                    isSpaces
                      ? "!w-[88vw] sm:!w-[82vw] md:!w-[76vw] lg:!w-[70vw] !h-full !flex !items-center"
                      : "!w-screen !h-screen !flex !items-center"
                  }
                >
                  <Card
                    src={src}
                    isNew={isNew}
                    isSpaces={isSpaces}
                    activeIndex={activeIndex}
                    i={i}
                    onAnimationComplete={() => {
                      setJustAddedIndex(null);
                    }}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
          {isSpaces && atEnd && (
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add image"
              className="fixed right-0 top-1/2 h-16 w-16  text-gray-400 hover:text-white z-50"
            >
              <PlusIcon
                className="fixed right-0 top-1/2"
                size={36}
                weight="bold"
              />
            </button>
          )}
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
