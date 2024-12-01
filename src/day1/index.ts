import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const getData = async () => {
  const list1 = <number[]>[],
    list2 = <number[]>[];
  await processInput(inputPath, (line) => {
    const [val1, val2] = line.split("   ");
    list1.push(parseInt(val1));
    list2.push(parseInt(val2));
  });

  if (list1.length !== list2.length) {
    throw new Error("processing error");
  }

  return {
    list1: list1.toSorted(),
    list2: list2.toSorted(),
    count: list1.length,
  };
};

const solve = getData().then(({ list1, list2, count }) => {
  return range(count).reduce((acc, nextIndex) => {
    const distance = Math.abs(list1[nextIndex] - list2[nextIndex]);
    return acc + distance;
  }, 0);
});

export { solve };

// pnpm tsx src/day1/index.ts
solve.then((result) => {
  console.log(result);
});
