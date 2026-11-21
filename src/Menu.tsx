import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

type Props = {
  children?: ReactNode;
  isInert: boolean;
  placement: "top" | "bottom" | "right";
};

const Menu = ({ children, isInert, placement }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const isTop = placement === "top";
  const isRight = placement === "right";
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
          ? "w-full rounded-b-xl border-x border-b border-cyan-500 p-4"
          : isRight
            ? "flex min-h-0 min-w-0 flex-none flex-col overflow-hidden rounded-l-xl border border-cyan-500 p-4"
            : "flex min-h-0 w-full flex-col overflow-hidden rounded-t-xl border-x border-t border-cyan-500 p-4"
      } bg-white shadow-lg`}
      style={
        isTop
          ? undefined
          : {
              maxHeight: "calc(50vh - 3rem)",
              ...(isRight
                ? {
                    width: "calc(100% - 3rem)",
                  }
                : {}),
            }
      }
    >
      {isTop ? content : <div className="flex min-h-0 flex-1 flex-col">{content}</div>}
    </div>
  );

  const toggleButton = (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-label={`${isTop ? "上部" : isRight ? "右側" : "下部"}メニューを${
        isExpanded ? "閉じる" : "開く"
      }`}
      onClick={() => setIsExpanded((expanded) => !expanded)}
      className={`relative shrink-0 cursor-pointer bg-transparent text-blue-900 ${
        isRight ? "h-20 w-12" : "h-12 w-20"
      }`}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox={isRight ? "0 0 48 80" : "0 0 80 48"}
        fill="white"
        stroke="#06b6d4"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path
          d={
            isTop
              ? "M1 1H79L40 47Z"
              : isRight
                ? "M47 1L1 40L47 79Z"
                : "M40 1L79 47H1Z"
          }
        />
      </svg>
      <svg
        aria-hidden="true"
        className={`absolute h-3 w-3 transition-transform duration-300 ${
          isRight
            ? `left-1 top-1/2 -translate-y-1/2 ${
                isExpanded ? "-rotate-90" : "rotate-90"
              }`
            : `left-1/2 ${
                isTop ? "bottom-1" : "top-1"
              } -translate-x-1/2 ${isExpanded === isTop ? "rotate-180" : ""}`
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
      className={`pointer-events-none fixed z-[9] flex ${
        isRight
          ? "inset-y-0 right-0 w-full max-w-md items-center justify-end"
          : `inset-x-0 justify-center ${isTop ? "top-0" : "bottom-0"}`
      }`}
      inert={isInert}
    >
      <div
        className={`pointer-events-auto flex transition-transform duration-300 ease-out ${
          isRight
            ? "w-full flex-row items-center"
            : `flex-col items-center ${isTop ? "w-64" : "w-full max-w-2xl"}`
        }`}
        style={
          {
            transform: isExpanded
              ? "translate(0, 0)"
              : isRight
                ? "translateX(calc(100% - 1.5rem))"
                : isTop
                  ? "translateY(calc(-100% + 1.5rem))"
                  : "translateY(calc(100% - 1.5rem))",
          }
        }
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
