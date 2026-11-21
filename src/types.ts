export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null; // 注意
};

export type Triangle = {
  id: string;
  points: string;
  color: string;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
};
