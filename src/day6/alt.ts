import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const { log } = console;

const getData = async () => {
  const lines: Array<Array<string>> = [];
  await processInput(inputPath, (line) => lines.push(Array.from(line)));
  if (!lines.every((line) => line.length === lines.at(0)?.length)) {
    throw new Error("input is not uniform");
  }

  log(`Input is a ${lines.length} x ${lines.at(0)?.length} grid`);
  return lines;
};

const data = await getData();
const [rowCount, colCount] = [data.length, data.at(0)!.length];

const obstacleMap = new Array<{ row: number; col: number }>();
for (const row of range(rowCount)) {
  for (const col of range(colCount)) {
    if (data[row][col] === "#") {
      obstacleMap.push({ row, col });
    }
  }
}

type Position = { row: number; col: number; direction: "N" | "E" | "S" | "W" };

const travelog: Position[] = [];

const recordStart = (): Position | null => {
  const exit = (pos: Position) => {
    travelog.push(pos);
    return pos;
  };

  for (const row of range(rowCount)) {
    for (const col of range(colCount)) {
      switch (data[row][col]) {
        case "^":
          return exit({ col, row, direction: "N" });
        case "v":
          return exit({ col, row, direction: "S" });
        case "<":
          return exit({ col, row, direction: "W" });
        case ">":
          return exit({ col, row, direction: "E" });
      }
    }
  }

  return null;
};

const calculateNextMove = () => {
  const current = travelog.at(-1);
  if (!current) {
    throw new Error("No current position found");
  }

  const next = { ...current };
  switch (current.direction) {
    case "N":
      next.row -= 1;
      break;
    case "E":
      next.col += 1;
      break;
    case "S":
      next.row += 1;
      break;
    case "W":
      next.col -= 1;
      break;
  }

  if (
    next.col < 0 ||
    next.col >= colCount ||
    next.row < 0 ||
    next.row >= rowCount
  ) {
    return true;
  }

  if (obstacleMap.find((ob) => ob.row === next.row && ob.col === next.col)) {
    next.col = current.col;
    next.row = current.row;
    switch (current.direction) {
      case "N":
        next.direction = "E";
        break;
      case "E":
        next.direction = "S";
        break;
      case "S":
        next.direction = "W";
        break;
      case "W":
        next.direction = "N";
        break;
    }
  }

  travelog.push(next);
  return false;
};

const solvePart1 = async () => {
  const start = recordStart();
  if (!start) {
    throw new Error("No starting position found");
  }

  let finished = false;
  while (!finished) {
    finished = calculateNextMove();
  }

  const keys = new Set<string>();
  const uniquePositions = travelog.reduce((acc, next) => {
    const key = `${next.row},${next.col}`;
    if (!keys.has(key)) {
      keys.add(key);
      return acc + 1;
    }
    return acc;
  }, 0);

  return uniquePositions;
};

export { solvePart1 };

const part1 = await solvePart1();
console.log(`Part 1: ${part1}`);
