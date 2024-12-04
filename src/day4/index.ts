import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const getData = async () => {
  const lines = <string[][]>[];
  await processInput(inputPath, (line) => lines.push(Array.from(line)));
  if (lines.length !== lines.at(0)?.length) {
    throw new Error("input is not square");
  }

  console.log(`Input is a ${lines.length} x ${lines.length} square`);
  return lines;
};

const data = await getData();
const dim = data.length;

type Coord = [number, number];
const getLetter = (coord: Coord) => data[coord[0]][coord[1]];

/** Return whether or not a set of co-rdinates is valid for the input data. */
const isValid = (coord: number[]): coord is Coord => {
  const [row, col] = coord;
  return coord.length === 2 && row >= 0 && row < dim && col >= 0 && col < dim;
};

/**
 * Look for a sequence 'MAS' originating from a given set of co-ordinates corresponding
 * to an 'X', given a function which defines the next co-ordinates to check. Returns
 * `true` if such a sequence is found, `false` otherwise.
 */
const findXmas = (xCoord: Coord, onNext: (current: Coord) => Coord) => {
  const mCoordinate = onNext(xCoord);
  if (!isValid(mCoordinate) || getLetter(mCoordinate) !== "M") {
    return false;
  }
  const aCoordinate = onNext(mCoordinate);
  if (!isValid(aCoordinate) || getLetter(aCoordinate) !== "A") {
    return false;
  }
  const sCoordinate = onNext(aCoordinate);
  if (!isValid(sCoordinate) || getLetter(sCoordinate) !== "S") {
    return false;
  }
  return true;
};

const solvePart1 = async () => {
  // Derive the positions of all Xs in the input data
  const xPositions = new Set<Coord>();
  for (const row of range(dim)) {
    for (const col of range(dim)) {
      if (getLetter([row, col]) === "X") {
        xPositions.add([row, col]);
      }
    }
  }

  let count = 0;
  for (const xPos of xPositions) {
    const countFromThisCoord = [
      // 8 directions to check for 'MAS' (I don't love this)
      findXmas(xPos, ([row, col]) => [row, col + 1]),
      findXmas(xPos, ([row, col]) => [row, col - 1]),
      findXmas(xPos, ([row, col]) => [row + 1, col]),
      findXmas(xPos, ([row, col]) => [row - 1, col]),
      findXmas(xPos, ([row, col]) => [row + 1, col + 1]),
      findXmas(xPos, ([row, col]) => [row - 1, col - 1]),
      findXmas(xPos, ([row, col]) => [row + 1, col - 1]),
      findXmas(xPos, ([row, col]) => [row - 1, col + 1]),
    ].filter(Boolean).length;

    count += countFromThisCoord;
  }

  return count;
};

/**
 * Look for two intersecting 'MAS' sequcnes originating from a given set of co-ordinates corresponding
 * to an 'A', given a function which derives the next and previous co-ordinates on both diagonals.
 * Returns `true` if such a sequence is found, `false` otherwise.
 */
const findMasX = (
  aCoord: Coord,
  getMajorDiag: (current: Coord) => [Coord, Coord],
  getMinorDiag: (current: Coord) => [Coord, Coord],
) => {
  const majorDiag = getMajorDiag(aCoord);
  const minorDiag = getMinorDiag(aCoord);

  if ([...majorDiag, ...minorDiag].some((coord) => !isValid(coord))) {
    return false;
  }

  const majorDiagLetters = majorDiag.map(getLetter);
  const minorDiagLetters = minorDiag.map(getLetter);

  return (
    majorDiagLetters.toSorted().join("") === "MS" &&
    minorDiagLetters.toSorted().join("") === "MS"
  );
};

const solvePart2 = async () => {
  const aPositions = new Set<Coord>();
  for (const row of range(dim)) {
    for (const col of range(dim)) {
      if (getLetter([row, col]) === "A") {
        aPositions.add([row, col]);
      }
    }
  }

  let count = 0;
  for (const aPos of aPositions) {
    count += Number(
      findMasX(
        aPos,
        ([row, col]) => [
          [row + 1, col + 1],
          [row - 1, col - 1],
        ],
        ([row, col]) => [
          [row - 1, col + 1],
          [row + 1, col - 1],
        ],
      ),
    );
  }

  return count;
};

export { solvePart1, solvePart2 };

const total = await solvePart1();
console.log(`Instances of 'XMAS': ${total}`);

const total2 = await solvePart2();
console.log(`Instances of 'MAS in X formation': ${total2}`);
