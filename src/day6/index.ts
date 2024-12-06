import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const { log } = console;

const POINTERS = ["^", "v", "<", ">"] as const;
type Pointer = (typeof POINTERS)[number];

const DIRECTIONS = ["N", "E", "S", "W"] as const;
type Direction = (typeof DIRECTIONS)[number];

const pointerToDirection: Record<Pointer, Direction> = {
  ["^"]: "N",
  ["v"]: "S",
  ["<"]: "W",
  [">"]: "E",
};

const directionToPointer: Record<Direction, Pointer> = {
  ["N"]: "^",
  ["S"]: "v",
  ["W"]: "<",
  ["E"]: ">",
};

class Grid extends Array<Array<string>> {
  initialise() {
    if (!this.every((line) => line.length === this.at(0)?.length)) {
      throw new Error("input is not uniform");
    }

    log(`Input is a ${this.length} x ${this.at(0)?.length} grid`);

    const start = this.getCurrentPosition();
    this.display();
    log(`Starting at (${start}) facing ${this.currentDirection}`);
  }

  display() {
    for (const line of this.map((l) => l.join(""))) {
      const hasPointer = line.includes(
        directionToPointer[this.currentDirection],
      );

      // Mark the current position's co-ordinates next to the row it's on
      log(line + (hasPointer ? ` ${this.getCurrentPosition()}` : ""));
    }
  }

  private exitPosition: [number, number] | null = null;

  private getCurrentPosition() {
    for (const [index, line] of this.entries()) {
      for (const pointer of POINTERS) {
        const start = line.findIndex((c) => c === pointer);
        if (start > 0) {
          this.currentDirection = pointerToDirection[pointer];
          return [index, start];
        }
      }
    }
  }

  private validCoordinate(i: number, j: number) {
    return i >= 0 && i < this.length && j >= 0 && j < this[0].length;
  }

  private isBlocked(i: number, j: number) {
    return this.validCoordinate(i, j) && this[i][j] === "#";
  }

  private currentDirection: Direction = "N";

  private turn() {
    const currentPosition = this.getCurrentPosition();
    if (!currentPosition) {
      throw new Error("Cannot find current position");
    }

    const [i, j] = currentPosition;
    this[i][j] = { N: ">", E: "v", S: "<", W: "^" }[this.currentDirection];

    this.currentDirection = ({ N: "E", E: "S", S: "W", W: "N" } as const)[
      this.currentDirection
    ];
  }

  getUniquePositions() {
    return this.reduce(
      (acc, next) => acc + next.filter((char) => char === "X").length,
      0,
    );
  }

  solve() {
    let solved = false;
    while (!solved) {
      solved = this.move();
    }
    this.display();

    const count = this.getUniquePositions();
    log(`End position (${this.exitPosition}); ${count} unique positions.`);

    return count;
  }

  private move() {
    const currentPosition = this.getCurrentPosition();
    if (!currentPosition) {
      throw new Error("Cannot find current position");
    }

    // TODO: Reduce duplication in this block
    const [i, j] = currentPosition;
    switch (this.currentDirection) {
      case "N": {
        const iNext = i - 1;
        if (this.validCoordinate(iNext, j)) {
          if (this.isBlocked(iNext, j)) {
            this.turn();
          } else {
            this[i][j] = "X";
            this[iNext][j] = "^";
          }
        } else {
          this.exitPosition = [i, j];
          this[i][j] = "X";
          return true;
        }
        break;
      }
      case "S": {
        const iNext = i + 1;
        if (this.validCoordinate(iNext, j)) {
          if (this.isBlocked(iNext, j)) {
            this.turn();
          } else {
            this[i][j] = "X";
            this[iNext][j] = "v";
          }
        } else {
          this.exitPosition = [i, j];
          this[i][j] = "X";
          return true;
        }
        break;
      }
      case "E": {
        const jNext = j + 1;
        if (this.validCoordinate(i, jNext)) {
          if (this.isBlocked(i, jNext)) {
            this.turn();
          } else {
            this[i][j] = "X";
            this[i][jNext] = ">";
          }
        } else {
          this.exitPosition = [i, j];
          this[i][j] = "X";
          return true;
        }
        break;
      }
      case "W": {
        const jNext = j - 1;
        if (this.validCoordinate(i, jNext)) {
          if (this.isBlocked(i, jNext)) {
            this.turn();
          } else {
            this[i][j] = "X";
            this[i][jNext] = "<";
          }
        } else {
          this.exitPosition = [i, j];
          this[i][j] = "X";
          return true;
        }
        break;
      }
    }

    // false indicates there are still more moves to be made
    return false;
  }
}

const getData = async () => {
  const lines = new Grid();
  await processInput(inputPath, (line) => lines.push(Array.from(line)));
  lines.initialise();
  return lines;
};

const data = await getData();

const solvePart1 = async () => data.solve();

export { solvePart1 };

const part1 = await solvePart1();
log(`Part 1: ${part1}`);
