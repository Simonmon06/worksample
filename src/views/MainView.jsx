import {
  SignOutIcon,
  PauseIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

console.log("ACCESS_KEY:", ACCESS_KEY);
export default function MainView() {
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
        const src = photo.urls.regular;
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-zinc-400 mb-3">Views</div>

        <div className="relative rounded-xl overflow-hidden shadow">
          <img
            src={photo?.src}
            alt="Room"
            className="w-full h-[64vh] object-cover"
          />

          {/* 顶部工具条 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm shadow">
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-zinc-100/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
            >
              <SignOutIcon size={16} weight="bold" />
              <span>EXIT</span>
            </button>

            <button
              onClick={() => console.log("enter my spaces")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-700 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <PauseIcon size={16} weight="bold" />
              <span>MY SPACES</span>
            </button>

            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-zinc-100/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <ShareNetworkIcon size={16} weight="bold" />
              <span>SHARE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
