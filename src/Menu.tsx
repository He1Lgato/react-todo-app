import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

type Props = {
  children?: ReactNode;
  isInert: boolean;
  placement: "top" | "bottom";
};

const Menu = ({ children, isInert, placement }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const isTop = placement === "top";
  const contentId = `${placement}-menu-content`;

  useEffect(() => {
    if (!isTop || !isExpanded) {
      return;
    }

    const updateTime = () => setNow(new Date());
    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [isExpanded, isTop]);

  const content = isTop ? (
    <time
      dateTime={now.toISOString()}
      className="mb-3 block text-center text-lg font-bold text-cyan-700 tabular-nums"
    >
      <span className="block">{dayjs(now).format("YYYY/MM/DD")}</span>
      <span className="block">{dayjs(now).format("HH:mm:ss")}</span>
    </time>
  ) : (
    children
  );

  const contentPanel = (
    <div
      id={contentId}
      aria-hidden={!isExpanded}
      inert={!isExpanded}
      className={`${
        isTop
          ? "w-full rounded-b-xl border-b"
          : "flex min-h-0 w-full flex-col overflow-hidden rounded-t-xl border-t"
      } border-x border-cyan-500 bg-white p-4 shadow-lg`}
      style={isTop ? undefined : { maxHeight: "calc(50vh - 3rem)" }}
    >
      {isTop ? content : <div className="flex min-h-0 flex-1 flex-col">{content}</div>}
    </div>
  );

  const toggleButton = (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-label={`${isTop ? "上部" : "下部"}メニューを${
        isExpanded ? "閉じる" : "開く"
      }`}
      onClick={() => setIsExpanded((expanded) => !expanded)}
      className="relative h-12 w-20 shrink-0 cursor-pointer bg-transparent text-blue-900"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 80 48"
        fill="white"
        stroke="#06b6d4"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d={isTop ? "M1 1H79L40 47Z" : "M40 1L79 47H1Z"} />
      </svg>
      <svg
        aria-hidden="true"
        className={`absolute ${
          isTop ? "bottom-1" : "top-1"
        } left-1/2 h-3 w-3 -translate-x-1/2 transition-transform duration-300 ${
          isExpanded === isTop ? "rotate-180" : ""
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
  );

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[9] flex justify-center ${
        isTop ? "top-0" : "bottom-0"
      }`}
      inert={isInert}
    >
      <div
        className={`pointer-events-auto flex flex-col items-center transition-transform duration-300 ease-out ${
          isTop ? "w-64" : "w-full max-w-2xl"
        }`}
        style={{
          transform: isExpanded
            ? "translateY(0)"
            : isTop
              ? "translateY(calc(-100% + 1.5rem))"
              : "translateY(calc(100% - 1.5rem))",
        }}
      >
        {isTop ? (
          <>
            {contentPanel}
            {toggleButton}
          </>
        ) : (
          <>
            {toggleButton}
            {contentPanel}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
