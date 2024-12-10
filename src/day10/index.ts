import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const { log } = console;

const getData = async () => {
  const heights = <number[][]>[];
  await processInput(inputPath, (line) => {
    const digits = Array.from(line).map((char) => parseInt(char, 10));
    heights.push(digits);
  });

  return heights;
};

const data = await getData();
const [rowCount, colCount] = [data.length, data.at(0)!.length];

const trailHeadMap = new Array<{ row: number; col: number }>();
for (const row of range(rowCount)) {
  for (const col of range(colCount)) {
    if (data[row][col] === 0) {
      trailHeadMap.push({ row, col });
    }
  }
}

type Coord = { row: number; col: number };
const toKey = (coord: Coord) => `${coord.row},${coord.col}` as const;
type CoordKey = ReturnType<typeof toKey>;
const fromKey = (key: CoordKey): Coord => {
  const [row, col] = key.split(",").map((x) => parseInt(x, 10));
  return { row, col };
};

const mapTrailHead = (row: number, col: number) => {
  let positions = new Set<CoordKey>([toKey({ row, col })]);
  for (let i = 1; i <= 9; i++) {
    const newPositions = new Set<CoordKey>();
    for (const pos of positions) {
      const { row, col } = fromKey(pos);
      const nextPositions = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
      ].filter(
        ({ row, col }) =>
          row >= 0 && row < rowCount && col >= 0 && col < colCount,
      );

      nextPositions.forEach((nextPos) => {
        if (data[nextPos.row][nextPos.col] === i) {
          newPositions.add(toKey(nextPos));
        }
      });
    }
    positions = newPositions;
  }

  // Return the number of finishing positions - this is the score for this trailhead
  return positions.size;
};

const solvePart1 = async () => {
  const scores = trailHeadMap.map(({ row, col }) => mapTrailHead(row, col));
  return scores.reduce((acc, score) => acc + score, 0);
};

const part1 = await solvePart1();
log(`Total score is ${part1}`);

const ARROW = "->";
const addToJourney = (journey: string, coord: Coord) =>
  journey.concat(ARROW, `${coord.row},${coord.col}`);

const journeyTip = (journey: string): Coord => {
  const [row, col] = journey
    .split(ARROW)
    .pop()!
    .split(",")
    .map((x) => parseInt(x, 10));
  return { row, col };
};

const mapDistinctTrails = (row: number, col: number) => {
  let journeys = new Set<string>([`${row},${col}`]);
  for (let i = 1; i <= 9; i++) {
    const newJourneys = new Set<string>();
    for (const j of journeys) {
      const { row, col } = journeyTip(j);
      const nextPositions = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
      ].filter(
        ({ row, col }) =>
          row >= 0 && row < rowCount && col >= 0 && col < colCount,
      );

      nextPositions.forEach((nextPos) => {
        if (data[nextPos.row][nextPos.col] === i) {
          newJourneys.add(addToJourney(j, nextPos));
        }
      });
    }
    journeys = newJourneys;
  }

  // Return the number of unique journey strings
  return journeys.size;
};

const solvePart2 = async () => {
  const scores = trailHeadMap.map(({ row, col }) =>
    mapDistinctTrails(row, col),
  );
  return scores.reduce((acc, score) => acc + score, 0);
};

const part2 = await solvePart2();
log(`Total score is ${part2}`);
