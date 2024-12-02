import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

type Report = number[];

const getData = async () => {
  const reports = <Report[]>[];
  await processInput(inputPath, (line) => {
    const levels = line.split(" ").map((val) => parseInt(val, 10));
    reports.push(levels);
  });

  console.log(`Read ${reports.length} reports`);
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

const isSafeWithDampener = (report: Report) => {
  if (isSafe(report)) {
    return true;
  }

  for (let i = 0; i < report.length; i++) {
    // New copy of the report with the i-th element removed
    const dampened = [...report];
    dampened.splice(i, 1);

    if (isSafe(dampened)) {
      return true;
    }
  }
  return false;
};

const solvePart2 = async () => data.filter(isSafeWithDampener).length;

export { solvePart1, solvePart2 };

// pnpm tsx src/day2/index.ts
const part1 = await solvePart1();
console.log(`Safe reports: ${part1}`);

const part2 = await solvePart2();
console.log(`Safe reports (with dampener): ${part2}`);
