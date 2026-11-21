import type { CSSProperties } from "react";
import "./TriangleBackground.css";

type Triangle = {
  points: string;
  key: string;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
};

const colors = [
  "#D9D0F5",
  "#C8D9F5",
  "#B9E3F5",
  "#A9EAF2",
  "#8DDFED",
  "#FFFFFF",
];

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

export default function TriangleBackground() {
  const size = 180;
  const height = (size * Math.sqrt(3)) / 2;

  const triangles: Triangle[] = [];

  for (let r = -8; r < 16; r++) {
    for (let c = -20; c < 20; c++) {
      const x1 = size * (c + r / 2);
      const x2 = x1 + size;
      const x3 = x1 + size / 2;

      const y1 = height * r;
      const y2 = height * (r + 1);

      const addTriangle = (points: string, key: string, seed: number) => {
        const random = pseudoRandom(seed);

        triangles.push({
          points,
          key,
          color: colors[Math.floor(random * colors.length)],
          opacity: 0.08 + pseudoRandom(seed + 1) * 0.18,
          duration: 8 + pseudoRandom(seed + 2) * 10,
          delay: -pseudoRandom(seed + 3) * 10,

          // 三角形ごとの移動量
          moveX: (pseudoRandom(seed + 4) - 0.5) * 10,
          moveY: (pseudoRandom(seed + 5) - 0.5) * 10,
        });
      };

      addTriangle(
        `${x1},${y1} ${x2},${y1} ${x3},${y2}`,
        `up-${r}-${c}`,
        (r + 8) * 1000 + (c + 20) * 2,
      );

      addTriangle(
        `${x2},${y1} ${x2 + size / 2},${y2} ${x3},${y2}`,
        `down-${r}-${c}`,
        (r + 8) * 1000 + (c + 20) * 2 + 1,
      );
    }
  }

  return (
    <div className="triangle-background">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {triangles.map((triangle) => (
          <polygon
            key={triangle.key}
            points={triangle.points}
            fill={triangle.color}
            fillOpacity={triangle.opacity}
            className="triangle"
            style={
              {
                animationDuration: `${triangle.duration}s`,
                animationDelay: `${triangle.delay}s`,
                "--move-x": `${triangle.moveX}px`,
                "--move-y": `${triangle.moveY}px`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}
