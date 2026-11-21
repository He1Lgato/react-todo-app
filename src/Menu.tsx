import { useState } from "react";

type Props = {
  isInert: boolean;
};

const Menu = ({ isInert }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9] flex justify-center"
      inert={isInert}
    >
      <div
        className="flex flex-col items-center transition-transform duration-300 ease-out"
        style={{
          transform: isExpanded
            ? "translateY(0)"
            : "translateY(calc(-100% + 1.5rem))",
        }}
      >
        <div
          id="app-menu-items"
          aria-hidden={!isExpanded}
          inert={!isExpanded}
          className="w-64 rounded-b-xl border-x border-b border-cyan-500 bg-white p-4 shadow-lg"
        >
          <button
            type="button"
            className="w-full cursor-pointer rounded-md border border-cyan-500 bg-white px-3 py-2 font-bold text-cyan-600 hover:bg-cyan-50"
          >
            テスト
          </button>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="app-menu-items"
          aria-label={isExpanded ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="relative h-12 w-20 shrink-0 cursor-pointer bg-cyan-500 text-white"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        >
          <svg
            aria-hidden="true"
            className={`absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Menu;
