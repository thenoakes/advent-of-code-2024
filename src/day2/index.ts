import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import { report } from "process";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

type Report = number[];

const getData = async () => {
  const reports = <Report[]>[];
  await processInput(inputPath, (line) => {
    const levels = line.split(" ").map((val) => parseInt(val, 10));
    reports.push(levels);
  });

  return reports;
};

const toDeltas = (report: Report) =>
  report.reduce<number[]>((acc, val, idx) => {
    if (idx === 0) {
      return acc;
    } else {
      return acc.concat(val - report[idx - 1]);
    }
  }, []);

const isSafe = (report: Report) => {
  const deltas = toDeltas(report);
  return (
    deltas.every((d) => d > 0 && d <= 3) ||
    deltas.every((d) => d < 0 && d >= -3)
  );
};

const data = await getData();

const solvePart1 = async () => data.filter(isSafe).length;

export { solvePart1 };

// pnpm tsx src/day2/index.ts
const part1 = await solvePart1();
console.log(`Safe paths: ${part1}`);
