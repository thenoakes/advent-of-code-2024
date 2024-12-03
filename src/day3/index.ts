import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const getData = async () => {
  const lines = <string[]>[];
  await processInput(inputPath, (line) => lines.push(line));
  return lines.join("");
};

const data = await getData();

type Operands = [number, number];

// Get the capture groups representing the function operands
const getOperands = (instruction: RegExpExecArray) =>
  instruction.slice(1, 3).map((operand) => parseInt(operand, 10)) as Operands;

const MUL = /mul\((\d{1,3}),(\d{1,3})\)/;

const solvePart1 = async () => {
  const matcher = new RegExp(MUL.source, "g");
  const instructions = data.matchAll(matcher);

  const processed = [...instructions].map(getOperands);

  return processed.reduce((acc, [a, b]) => acc + a * b, 0);
};

const solvePart2 = async () => {
  const DO_DONT = /do\(\)|don't\(\)/;

  const matcher = new RegExp(`${DO_DONT.source}|${MUL.source}`, "g");
  const instructions = data.matchAll(matcher);

  let enabled = true;
  return [...instructions].reduce<number>((acc, instruction) => {
    switch (instruction.at(0)) {
      case "do()":
        enabled = true;
        break;
      case "don't()":
        enabled = false;
        break;
      default:
        if (enabled) {
          const [a, b] = getOperands(instruction);
          return acc + a * b;
        }
    }
    return acc;
  }, 0);
};

export { solvePart1, solvePart2 };

const total = await solvePart1();
console.log(`Sum of multiplications: ${total}`);

const refinedTotal = await solvePart2();
console.log(`Sum of enabled multiplications: ${refinedTotal}`);
