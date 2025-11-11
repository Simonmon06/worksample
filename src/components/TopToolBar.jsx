import {
  SignOutIcon,
  PauseIcon,
  ShareNetworkIcon,
  CheckIcon,
} from "@phosphor-icons/react";

export const TopToolBar = ({ mode, setMode }) => {
  const btn =
    "btn btn-sm btn-ghost h-10 px-4 gap-2 rounded-[12px] " +
    "bg-black/35 text-white hover:bg-white hover:text-zinc-900 ";

  return (
    <div className="fixed top-0 inset-x-0 z-20 flex justify-center">
      <div
        className="inline-flex h-14 w-fit items-center gap-2 p-2
                  bg-[rgba(48,52,56,0.55)] backdrop-blur-sm shadow rounded-b-[16px]"
      >
        {mode === "default" ? (
          <>
            <button className={btn}>
              <SignOutIcon size={16} weight="bold" />
              EXIT
            </button>

            <button className={btn} onClick={() => setMode("mySpaces")}>
              <PauseIcon size={16} weight="bold" />
              MY SPACES
            </button>

            <button className={btn}>
              <ShareNetworkIcon size={16} weight="bold" />
              SHARE
            </button>
          </>
        ) : (
          <button
            className={`${btn} rounded-[16px]`}
            onClick={() => setMode("default")}
          >
            <CheckIcon size={16} weight="bold" />
            DONE
          </button>
        )}
      </div>
    </div>
  );
};
