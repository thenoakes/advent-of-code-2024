import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const getData = async () => {
  const data = Array<{ value: number; operands: number[] }>();
  await processInput(inputPath, (line) => {
    const [value, operands] = line.split(": ");
    data.push({
      value: parseInt(value, 10),
      operands: operands.split(" ").map((x) => parseInt(x, 10)),
    });
  });
  return data;
};

const data = await getData();

type Operator = "add" | "multiply" | "concatenate";

const applyConcatenation = (
  runningValue: number,
  operand: number,
  ops: Operator[],
) => {
  const newValue = parseInt(`${runningValue}${operand}`, 10);
  return [newValue, ops.concat("concatenate")] as const;
};

let enable_concatenation = false;

const findOperators = (value: number, operands: number[]) => {
  let operatorMap = new Map<number, Operator[]>([[operands[0], []]]);

  for (const operand of operands.slice(1)) {
    const runningValues = [...operatorMap.entries()];
    operatorMap = new Map<number, Operator[]>(
      runningValues.flatMap(([v, ops]) =>
        [
          [v + operand, ops.concat("add")] as const,
          [v * operand, ops.concat("multiply")] as const,
          ...(enable_concatenation
            ? [applyConcatenation(v, operand, ops)]
            : []),
        ]
          // The calculation always increases with these operators
          // So we can trim away any values already larger than the target
          .filter(([v]) => v <= value),
      ),
    );
  }

  return operatorMap;
};

const findSolution = (value: number, operands: number[]) => {
  const operatorMap = findOperators(value, operands);
  return operatorMap.get(value);
};

const getSumOfSolutions = () =>
  data
    .map((d) => ({ ...d, operators: findSolution(d.value, d.operands) }))
    .filter((d) => d.operators !== undefined)
    .reduce((acc, next) => acc + next.value, 0);

const solvePart1 = async () => {
  enable_concatenation = false;
  return getSumOfSolutions();
};

const solvePart2 = async () => {
  enable_concatenation = true;
  return getSumOfSolutions();
};

export { solvePart1, solvePart2 };

const part1 = await solvePart1();
console.log(`Total value of lines with valid solutions: ${part1}`);

const part2 = await solvePart2();
console.log(
  `Total value of lines with valid solutions (including concatenation): ${part2}`,
);
