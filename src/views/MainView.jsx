import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TopToolBar } from "../components/TopToolBar";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

console.log("ACCESS_KEY:", ACCESS_KEY);
export default function MainView() {
  const [mode, setMode] = useState("default");
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const srcs = photos.map((p) => p.urls.raw);

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
          {photos?.srcs[0] && (
            <img
              src={photos.srcs[0]}
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
