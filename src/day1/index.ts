import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const getData = async () => {
  const list1 = <number[]>[],
    list2 = <number[]>[];
  await processInput(inputPath, (line) => {
    const [val1, val2] = line.split("   ").map((val) => parseInt(val, 10));
    list1.push(val1);
    list2.push(val2);
  });

  if (list1.length !== list2.length) {
    throw new Error("processing error");
  }

  return {
    list1: list1.toSorted(),
    list2: list2.toSorted(),
  };
};

const { list1, list2 } = await getData();

const solvePart1 = async () => {
  return range(list1.length).reduce((acc, nextIndex) => {
    const distance = Math.abs(list1[nextIndex] - list2[nextIndex]);
    return acc + distance;
  }, 0);
};

const solvePart2 = async () => {
  const list2Frequency = list2.reduce((acc, val) => {
    return acc.has(val) ? acc.set(val, acc.get(val)! + 1) : acc.set(val, 1);
  }, new Map<number, number>());

  return list1.reduce((acc, val) => {
    const matches = list2Frequency.get(val) ?? 0;
    return acc + val * matches;
  }, 0);
};

export { solvePart1, solvePart2 };

// pnpm tsx src/day1/index.ts
const result1 = await solvePart1();
console.log(`Total distance: ${result1}`);

const result2 = await solvePart2();
console.log(`Total similarity: ${result2}`);
