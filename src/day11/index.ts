import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const { log } = console;

class Stone {
  static cache = new Map<string, number>();

  asNumber: number;
  asString: string;

  get length() {
    return this.asString.length;
  }

  constructor(input: string) {
    this.asNumber = parseInt(input, 10);
    // Trim any leading zeroes
    this.asString = input.replace(/^0+/, "");
  }

  process(): Stone[] {
    if (this.asNumber === 0) {
      return [new Stone("1")];
    }
    if (this.length % 2 === 0) {
      return [
        new Stone(this.asString.slice(0, this.length / 2)),
        new Stone(this.asString.slice(this.length / 2)),
      ];
    }
    return [new Stone(`${this.asNumber * 2024}`)];
  }

  processN(n: number): number {
    const key = `${this.asNumber}x${n}`;
    if (Stone.cache.has(key)) {
      return Stone.cache.get(key)!;
    }

    if (n === 0) {
      return 1;
    }

    const result = this.process()
      .map((stone) => stone.processN(n - 1))
      .reduce((acc, x) => acc + x, 0);

    Stone.cache.set(key, result);

    return result;
  }
}

const getData = async () => {
  const stones = <Stone[]>[];
  await processInput(inputPath, (line) => {
    stones.push(...line.split(" ").map((x) => new Stone(x)));
  });

  return stones;
};

const data = await getData();

const solvePart1 = async () => {
  let stones = [...data];
  for (let i = 1; i <= 25; i++) {
    stones = stones.flatMap((stone) => stone.process());
  }

  return stones.length;
};

const part1 = await solvePart1();
log(`After blinking there will be ${part1} stones`);

const solvePart2 = async () => {
  const stones = [...data];
  // This time, process each single starting stone individually (and utilise caching)
  return stones.reduce((acc, s) => acc + s.processN(75), 0);
};

const part2 = await solvePart2();
log(`After blinking there will be ${part2} stones`);
