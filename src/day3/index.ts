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

const solvePart1 = async () => {
  const instructions = data.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g);
  const processed = [...instructions].map(getOperands);

  return processed.reduce((acc, [a, b]) => acc + a * b, 0);
};

const total = await solvePart1();
console.log(`Sum of multiplications: ${total}`);
