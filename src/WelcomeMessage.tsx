import { useEffect, useState } from "react";

// コンポーネントに渡す引数 (Props) の型を定義する
// 型には Props という名前を付けることがよくあります。
type Props = {
  name: string;
  uncompletedCount: number;
  onCountVisible: () => void;
};

// WelcomeMessage という関数コンポーネントを定義する
// コンポーネントの名前はパスカルケースで記述する
const WelcomeMessage = ({ name, uncompletedCount, onCountVisible }: Props) => {
  // JSX を返す前に、通常の TypeScript の処理を記述できる
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";
  const [isGreetingMoved, setIsGreetingMoved] = useState(false);
  const [isCountVisible, setIsCountVisible] = useState(false);

  useEffect(() => {
    const moveTimeoutId = window.setTimeout(() => {
      setIsGreetingMoved(true);
    }, 1000);
    const countTimeoutId = window.setTimeout(() => {
      setIsCountVisible(true);
      onCountVisible();
    }, 1700);

    return () => {
      window.clearTimeout(moveTimeoutId);
      window.clearTimeout(countTimeoutId);
    };
  }, [onCountVisible]);

  // 【重要】JSX を使って UI を記述し、return で返す
  return (
    <div className="absolute inset-0 text-blue-300">
      <div
        className="absolute inset-x-0 top-1/2 text-3xl font-bold transition-transform duration-700 ease-[cubic-bezier(0,0,0.2,1)] md:text-5xl"
        style={{
          transform: isGreetingMoved
            ? "translateY(calc(-100% - 1rem))"
            : "translateY(-50%)",
        }}
      >
        {greeting}、{name}さん。
      </div>
      {isCountVisible && (
        <div className="absolute inset-x-0 top-1/2 translate-y-4 text-2xl font-bold md:text-3xl">
          未完了のタスクは{uncompletedCount}件です。
        </div>
      )}
    </div>
  );
};

// 他のファイルから WelcomeMessage を import できるようにする
export default WelcomeMessage;
