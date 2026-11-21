import type { ChangeEvent } from "react";
import { useState, useEffect, useCallback } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import Calendar from "./Calendar";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import TriangleBackground from "./TriangleBackground";
import Menu from "./Menu";

const localStorageKey = "TodoApp";
const userNameStorageKey = "TodoAppUserName";

const loadUserName = (): string => {
  return localStorage.getItem(userNameStorageKey)?.trim() ?? "";
};

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
};

type AddTodoStep =
  | "closed"
  | "form-fading-in"
  | "form"
  | "confirmation-fading-in"
  | "confirmation"
  | "confirmation-fading-out";

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
  }));
};

const getTodoNameError = (name: string): string => {
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 32) {
    return "前後の空白を除いて、2文字以上、32文字以内で入力してください";
  }
  return "";
};

const getUserNameError = (name: string): string => {
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 32) {
    return "前後の空白を除いて、1文字以上、32文字以内で入力してください";
  }
  return "";
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [userName, setUserName] = useState(loadUserName);
  const [userNameInput, setUserNameInput] = useState("");
  const [isUserNameTouched, setIsUserNameTouched] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const [isWelcomeFading, setIsWelcomeFading] = useState(false);
  const [isTodoBackgroundVisible, setIsTodoBackgroundVisible] = useState(false);
  const [isClickHintVisible, setIsClickHintVisible] = useState(false);
  const [addTodoStep, setAddTodoStep] = useState<AddTodoStep>("closed");
  const [isAddTodoFadingIn, setIsAddTodoFadingIn] = useState(false);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const uncompletedCount = todos.filter((todo) => !todo.isDone).length;
  const [isNameTouched, setIsNameTouched] = useState(false);
  const newTodoNameError = getTodoNameError(newTodoName);
  const isNewTodoNameInvalid = newTodoNameError !== "";
  const showNewTodoNameError = isNameTouched && isNewTodoNameInvalid;
  const userNameError = getUserNameError(userNameInput);
  const isUserNameInvalid = userNameError !== "";
  const showUserNameError = isUserNameTouched && isUserNameInvalid;
  const isAddTodoOpen = addTodoStep !== "closed";
  const isConfirmationLayerVisible =
    addTodoStep === "confirmation-fading-in" ||
    addTodoStep === "confirmation" ||
    addTodoStep === "confirmation-fading-out";
  const isBackgroundBlurred =
    (isWelcomeVisible && !isWelcomeFading) || isAddTodoOpen;

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (!isWelcomeFading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsWelcomeVisible(false);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isWelcomeFading]);

  useEffect(() => {
    if (!isAddTodoOpen) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsAddTodoFadingIn(true);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isAddTodoOpen]);

  useEffect(() => {
    if (
      addTodoStep === "form-fading-in" ||
      addTodoStep === "confirmation-fading-in"
    ) {
      const animationFrameId = window.requestAnimationFrame(() => {
        setAddTodoStep((currentStep) =>
          currentStep === "form-fading-in"
            ? "form"
            : currentStep === "confirmation-fading-in"
              ? "confirmation"
              : currentStep,
        );
      });

      return () => window.cancelAnimationFrame(animationFrameId);
    }

    if (addTodoStep === "confirmation-fading-out") {
      const timeoutId = window.setTimeout(() => {
        setAddTodoStep((currentStep) =>
          currentStep === "confirmation-fading-out" ? "form" : currentStep,
        );
      }, 500);

      return () => window.clearTimeout(timeoutId);
    }
  }, [addTodoStep]);

  useEffect(() => {
    if (!isTodoBackgroundVisible || isWelcomeFading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsClickHintVisible(true);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isTodoBackgroundVisible, isWelcomeFading]);

  const updateNewTodoName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(e.target.value);
    setIsNameTouched(true);
  };

  const updateNewTodoPriority = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const updateUserName = (e: ChangeEvent<HTMLInputElement>) => {
    setUserNameInput(e.target.value);
    setIsUserNameTouched(true);
  };

  const saveUserName = () => {
    if (isUserNameInvalid) {
      setIsUserNameTouched(true);
      return;
    }

    const trimmedUserName = userNameInput.trim();
    localStorage.setItem(userNameStorageKey, trimmedUserName);
    setUserName(trimmedUserName);
  };

  const updateIsDone = (id: string, value: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: value } : todo,
      ),
    );
  };

  const removeCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.isDone));
  };

  const remove = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.length - uncompletedCount;
  const revealTodoBackground = useCallback(() => {
    setIsTodoBackgroundVisible(true);
  }, []);

  const addNewTodo = () => {
    if (isNewTodoNameInvalid) {
      setIsNameTouched(true);
      return;
    }

    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName.trim(),
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
    setIsNameTouched(false);
    setAddTodoStep("closed");
    setIsAddTodoFadingIn(false);
  };

  const openAddTodo = () => {
    setIsAddTodoFadingIn(false);
    setAddTodoStep("form-fading-in");
  };

  return (
    <>
      <TriangleBackground />
      <Menu isInert={isBackgroundBlurred} placement="top" />
      <Menu isInert={isBackgroundBlurred} placement="right">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TodoList
              todos={todos}
              updateIsDone={updateIsDone}
              remove={remove}
            />
          </div>
          <div className="shrink-0 border-t border-cyan-200 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={removeCompletedTodos}
                disabled={completedCount === 0}
                className={twMerge(
                  "min-w-0 flex-1 cursor-pointer rounded-md border border-red-500 bg-white px-3 py-1 font-medium text-red-500",
                  "hover:bg-red-50",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white",
                )}
              >
                完了済みのタスクを削除
              </button>
              <button
                type="button"
                onClick={openAddTodo}
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600"
              >
                タスクの追加
              </button>
            </div>
          </div>
        </div>
      </Menu>
      <header className="px-4 pt-10">
        <h1 className="text-2xl font-bold">TodoApp</h1>
      </header>
      <main
        className="mx-auto w-full max-w-2xl px-4 pt-4 pb-10"
        inert={isWelcomeVisible || isAddTodoOpen}
      >
        <button
          type="button"
          onClick={openAddTodo}
          className="mb-4 cursor-pointer rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600"
        >
          タスクの追加
        </button>
        <Calendar
          todos={todos}
          updateIsDone={updateIsDone}
          remove={remove}
        />
      </main>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-10 transition-[backdrop-filter] duration-500 ease-[cubic-bezier(0,0,0.2,1)] ${
          isBackgroundBlurred ? "backdrop-blur-sm" : "backdrop-blur-0"
        }`}
      />
      {isAddTodoOpen && (
        <div
          className={`fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 transition-opacity duration-500 ease-[cubic-bezier(0,0,0.2,1)] ${
            isAddTodoFadingIn ? "opacity-100" : "opacity-0"
          }`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setAddTodoStep("closed");
              setIsAddTodoFadingIn(false);
            }
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isNewTodoNameInvalid) {
                setIsNameTouched(true);
                return;
              }
              if (newTodoDeadline === null) {
                setAddTodoStep("confirmation-fading-in");
                return;
              }
              addNewTodo();
            }}
            role="dialog"
            aria-modal="true"
            aria-hidden={isConfirmationLayerVisible}
            aria-labelledby="newTodoHeading"
            inert={isConfirmationLayerVisible}
            className={`max-h-full w-full max-w-2xl space-y-2 overflow-y-auto rounded-md border border-slate-700 bg-slate-900 p-3 drop-shadow transition-[filter,opacity] duration-500 ease-[cubic-bezier(0,0,0.2,1)] ${
              addTodoStep === "form-fading-in" ? "opacity-0" : "opacity-100"
            } ${
              isConfirmationLayerVisible &&
              addTodoStep !== "confirmation-fading-out"
                ? "blur-sm"
                : "blur-0"
            }`}
          >
            <h2 id="newTodoHeading" className="text-lg font-bold">
              新しいタスクの追加
            </h2>

            <div>
              <div className="flex items-center space-x-2">
                <label className="font-bold" htmlFor="newTodoName">
                  名前
                </label>
                <input
                  id="newTodoName"
                  name="todoName"
                  type="text"
                  required
                  autoFocus
                  value={newTodoName}
                  onChange={updateNewTodoName}
                  aria-invalid={showNewTodoNameError}
                  aria-describedby={
                    showNewTodoNameError ? "newTodoNameError" : undefined
                  }
                  className={twMerge(
                    "min-w-0 grow rounded-md border border-slate-600 bg-slate-800 p-2 text-white placeholder:text-slate-400",
                    showNewTodoNameError && "border-red-500 outline-red-500",
                  )}
                  placeholder="2文字以上、32文字以内で入力してください"
                />
              </div>
              {showNewTodoNameError && (
                <div
                  id="newTodoNameError"
                  aria-live="polite"
                  className="ml-10 flex items-center space-x-1 text-sm font-medium text-red-500"
                >
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-0.5"
                  />
                  <div>{newTodoNameError}</div>
                </div>
              )}
            </div>

            <fieldset>
              <legend className="mb-1 font-bold">優先度</legend>
              <div className="flex gap-5">
                {[1, 2, 3].map((value) => (
                  <label key={value} className="flex items-center space-x-1">
                    <input
                      id={`priority-${value}`}
                      name="priorityGroup"
                      type="radio"
                      value={value}
                      checked={newTodoPriority === value}
                      onChange={updateNewTodoPriority}
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-2">
              <label className="font-bold" htmlFor="deadline">
                期限
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={
                  newTodoDeadline
                    ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                    : ""
                }
                onChange={updateDeadline}
                className="max-w-full min-w-0 rounded-md border border-slate-600 bg-slate-800 px-2 py-0.5 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isNewTodoNameInvalid}
                className={twMerge(
                  "cursor-pointer rounded-md px-3 py-1",
                  "bg-indigo-500 font-bold text-white hover:bg-indigo-600",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-500",
                )}
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddTodoStep("closed");
                  setIsAddTodoFadingIn(false);
                }}
                className="cursor-pointer rounded-md bg-slate-700 px-3 py-1 font-medium text-white hover:bg-slate-600"
              >
                キャンセル
              </button>
            </div>
          </form>
          {isConfirmationLayerVisible && (
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 px-4 transition-opacity duration-500 ease-[cubic-bezier(0,0,0.2,1)] ${
                addTodoStep === "confirmation" ? "opacity-100" : "opacity-0"
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="deadlineConfirmationHeading"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addNewTodo();
                }
              }}
            >
              <div className="w-full max-w-md rounded-md border border-slate-700 bg-slate-900 p-6 text-center drop-shadow">
                <h2
                  id="deadlineConfirmationHeading"
                  className="mb-6 text-lg font-bold"
                >
                  期限を設定しなくてもよろしいですか？
                </h2>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setAddTodoStep("confirmation-fading-out")}
                    className="cursor-pointer rounded-md bg-slate-700 px-3 py-1 font-medium text-white hover:bg-slate-600"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={addNewTodo}
                    className="cursor-pointer rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {isWelcomeVisible && (
        <div
          className={`fixed inset-0 z-10 flex min-h-screen items-center justify-center px-4 text-center transition-[opacity,background-color] ease-[cubic-bezier(0,0,0.2,1)] ${
            isWelcomeFading
              ? "opacity-0 duration-500"
              : isTodoBackgroundVisible
                ? "opacity-100 duration-1000"
                : "opacity-100 duration-500"
          } ${isTodoBackgroundVisible ? "bg-black/40" : "bg-black"} ${
            userName ? "cursor-pointer" : ""
          }`}
          onClick={() => {
            if (userName) {
              setIsWelcomeFading(true);
            }
          }}
        >
          {userName ? (
            <>
              <div
                className="text-3xl font-bold md:text-5xl"
                role="status"
                aria-live="polite"
              >
                <WelcomeMessage
                  name={userName}
                  uncompletedCount={uncompletedCount}
                  onCountVisible={revealTodoBackground}
                />
              </div>
              {isClickHintVisible && (
                <div className="absolute inset-x-0 top-[65%] animate-pulse text-center text-sm text-slate-400">
                  Click | Touch any where
                </div>
              )}
            </>
          ) : (
            <form
              className="w-full max-w-md space-y-4 rounded-md border border-cyan-500 bg-slate-900 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                saveUserName();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-cyan-300">
                ユーザー名を入力してください
              </h2>
              <input
                type="text"
                required
                autoFocus
                value={userNameInput}
                onChange={updateUserName}
                aria-invalid={showUserNameError}
                aria-describedby={showUserNameError ? "userNameError" : undefined}
                className={twMerge(
                  "w-full rounded-md border border-cyan-500 bg-white p-3 text-slate-900",
                  showUserNameError && "border-red-500 outline-red-500",
                )}
                placeholder="1文字以上、32文字以内"
              />
              {showUserNameError && (
                <div
                  id="userNameError"
                  className="text-sm font-medium text-red-500"
                  aria-live="polite"
                >
                  {userNameError}
                </div>
              )}
              <button
                type="submit"
                disabled={isUserNameInvalid}
                className="cursor-pointer rounded-md border border-cyan-500 bg-white px-4 py-2 font-bold text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                登録
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default App;
