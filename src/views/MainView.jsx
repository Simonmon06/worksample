import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TopToolBar } from "../components/TopToolBar";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

console.log("ACCESS_KEY:", ACCESS_KEY);
export default function MainView() {
  const [mode, setMode] = useState("default");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function fetchOnePhoto() {
      try {
        const photoId = "tHkJAMcO3QE";

        const res = await axios.get(
          `https://api.unsplash.com/photos/${photoId}`,
          {
            params: {
              client_id: ACCESS_KEY,
            },
          }
        );
        const photo = res.data;
        console.log(photo);
        const src = photo.urls.raw;
        if (alive) {
          setPhoto({ src });
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchOnePhoto();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen  text-zinc-100 overflow-hidden">
      <motion.div
        className={`fixed inset-0 bg-zinc-900 ${
          mode === "mySpaces" ? "pointer-events-auto" : "pointer-events-none"
        }`}
        initial={false}
        animate={{ opacity: mode === "mySpaces" ? 0.6 : 0 }}
        transition={{ duration: 0.35 }}
      />

      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={
            mode === "default"
              ? "w-screen h-screen overflow-hidden rounded-none shadow-none"
              : "w-full max-w-5xl aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl"
          }
        >
          {photo?.src && (
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          )}
        </motion.div>
      </div>

      <TopToolBar mode={mode} setMode={setMode} />
    </div>
  );
}
