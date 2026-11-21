import { useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import dayjs from "dayjs";
import TodoItem from "./TodoItem";
import type { Todo } from "./types";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const dateKey = (date: Date): string => dayjs(date).format("YYYY-MM-DD");

const Calendar = ({ todos, updateIsDone, remove }: Props) => {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const touchStartX = useRef<number | null>(null);
  const wheelLocked = useRef(false);
  const wheelUnlockTimeout = useRef<number | undefined>(undefined);
  const monthSliderRef = useRef<HTMLDivElement | null>(null);
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();

  const todosByDate = useMemo(() => {
    const groupedTodos = new Map<string, Todo[]>();

    todos.forEach((todo) => {
      if (todo.deadline === null || Number.isNaN(todo.deadline.getTime())) {
        return;
      }

      const key = dateKey(todo.deadline);
      const dayTodos = groupedTodos.get(key) ?? [];
      dayTodos.push(todo);
      groupedTodos.set(key, dayTodos);
    });

    return groupedTodos;
  }, [todos]);

  useEffect(() => {
    return () => {
      if (wheelUnlockTimeout.current !== undefined) {
        window.clearTimeout(wheelUnlockTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const slider = monthSliderRef.current;
    if (slider === null) {
      return;
    }

    const handleWheel = (event: globalThis.WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (Math.abs(delta) < 10) {
        return;
      }

      event.preventDefault();
      if (wheelLocked.current) {
        return;
      }
      wheelLocked.current = true;
      wheelUnlockTimeout.current = window.setTimeout(() => {
        wheelLocked.current = false;
      }, 250);

      const nextMonth = new Date(year, month + (delta > 0 ? 1 : -1), 1);
      setDisplayMonth(nextMonth);
      setSelectedDate(nextMonth);
    };

    slider.addEventListener("wheel", handleWheel, { passive: false });
    return () => slider.removeEventListener("wheel", handleWheel);
  }, [year, month]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const calendarDates = Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth
      ? new Date(year, month, day)
      : null;
  });
  const selectedTodos = todosByDate.get(dateKey(selectedDate)) ?? [];
  const todayKey = dateKey(new Date());

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(year, month + amount, 1);
    setDisplayMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 50) {
      return;
    }

    changeMonth(deltaX < 0 ? 1 : -1);
  };

  return (
    <section
      aria-label="タスクカレンダー"
      className="mt-4 rounded-md border border-cyan-500 bg-white p-3 text-slate-800 shadow"
    >
      <div
        ref={monthSliderRef}
        role="group"
        aria-label="月の切り替え"
        className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 overflow-hidden text-center select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label={`前月 ${dayjs(previousMonth).format("YYYY年M月")}`}
          className="min-w-0 cursor-pointer truncate px-1 py-1 text-sm font-medium text-cyan-700/40 hover:text-cyan-700 sm:text-base"
        >
          {dayjs(previousMonth).format("YYYY年M月")}
        </button>
        <h2 className="whitespace-nowrap text-lg font-bold text-cyan-700">
          {dayjs(displayMonth).format("YYYY年M月")}
        </h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label={`次月 ${dayjs(nextMonth).format("YYYY年M月")}`}
          className="min-w-0 cursor-pointer truncate px-1 py-1 text-sm font-medium text-cyan-700/40 hover:text-cyan-700 sm:text-base"
        >
          {dayjs(nextMonth).format("YYYY年M月")}
        </button>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-cyan-200 text-center">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="border-r border-b border-cyan-200 bg-cyan-50 py-1 text-sm font-bold"
          >
            {weekday}
          </div>
        ))}
        {calendarDates.map((date, index) => {
          if (date === null) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
                className="min-h-12 border-r border-b border-cyan-200 bg-slate-50"
              />
            );
          }

          const key = dateKey(date);
          const dayTodos = todosByDate.get(key) ?? [];
          const isSelected = key === dateKey(selectedDate);
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${dayjs(date).format("YYYY年M月D日")}、期限${dayTodos.length}件`}
              onClick={() => setSelectedDate(date)}
              className={`flex min-h-12 flex-col items-center justify-center border-r border-b border-cyan-200 px-0.5 py-1 text-sm hover:bg-cyan-50 ${
                isSelected ? "bg-cyan-100 text-cyan-800" : "bg-white"
              } ${isToday ? "font-bold" : ""}`}
            >
              <span>{date.getDate()}</span>
              {dayTodos.length > 0 && (
                <span className="text-[10px] leading-3 text-cyan-700">
                  {dayTodos.length}件
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2" aria-live="polite">
        <h3 className="font-bold text-cyan-700">
          {dayjs(selectedDate).format("YYYY/MM/DD")}のタスク
        </h3>
        {selectedTodos.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                updateIsDone={updateIsDone}
                remove={remove}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            この日に期限のあるタスクはありません。
          </p>
        )}
      </div>
    </section>
  );
};

export default Calendar;
