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

type Coord = [number, number];

const antennaMap = new Map<string, Array<Coord>>();
for (const row of range(rowCount)) {
  for (const col of range(colCount)) {
    const antenna = data[row][col];
    if (!antennaMap.has(antenna)) {
      antennaMap.set(antenna, []);
    }
    antennaMap.get(antenna)?.push([row, col]);
  }
}
antennaMap.delete(".");

const findPairs = (coords: Array<Coord>) =>
  coords
    .flatMap((a, i) => coords.slice(i + 1).map((b) => [a, b]))
    .map(([a, b]) => {
      const [colA, rowA] = a;
      const [colB, rowB] = b;
      const colDiff = colB - colA;
      const rowDiff = rowB - rowA;
      return { a, b, colDiff, rowDiff };
    });

const solvePart1 = async () => {
  const antinodes = new Set<string>();

  antennaMap.forEach((coords) => {
    const pairs = findPairs(coords);
    for (const { a, b, colDiff, rowDiff } of pairs) {
      {
        const [col, row] = a;
        const nodeCol = col - colDiff;
        const nodeRow = row - rowDiff;
        if (
          nodeCol >= 0 &&
          nodeCol < colCount &&
          nodeRow >= 0 &&
          nodeRow < rowCount
        ) {
          antinodes.add(`${nodeCol},${nodeRow}`);
        }
      }
      {
        const [col, row] = b;
        const nodeCol = col + colDiff;
        const nodeRow = row + rowDiff;
        if (
          nodeCol >= 0 &&
          nodeCol < colCount &&
          nodeRow >= 0 &&
          nodeRow < rowCount
        ) {
          antinodes.add(`${nodeCol},${nodeRow}`);
        }
      }
    }
  });

  return antinodes.size;
};

export { solvePart1 };

const part1 = await solvePart1();
console.log(`Part 1: ${part1}`);
