import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";
import range from "../lib/range";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

type OrderingRule = [number, number];

const parseOrderingRule = (rule: string) => {
  const [first, second] = rule.split("|").map((x) => parseInt(x, 10));
  return <OrderingRule>[first, second];
};

const parsePageUpdate = (update: string) =>
  update.split(",").map((x) => parseInt(x, 10));

const getData = async () => {
  const orderingRules = <string[]>[];
  const pageUpdates = <string[]>[];

  let hasProcessedRules = false;
  await processInput(inputPath, (line) => {
    if (line === "") {
      hasProcessedRules = true;
      return;
    }

    if (hasProcessedRules) {
      pageUpdates.push(line);
    } else {
      orderingRules.push(line);
    }
  });

  console.log(
    `Imported ${orderingRules.length} ordering rules and ${pageUpdates.length} page updates.`,
  );

  return {
    rules: orderingRules.map(parseOrderingRule),
    updates: pageUpdates.map(parsePageUpdate),
  };
};

const data = await getData();

const updateSatisfiesOrderingRule = (
  update: number[],
  [first, second]: OrderingRule,
) => {
  if (!update.includes(first) || !update.includes(second)) {
    return true;
  }

  return update.indexOf(first) < update.indexOf(second);
};

const getMiddlePageNumber = (update: number[]) =>
  update[(update.length - 1) / 2];

const solvePart1 = async () => {
  const { rules, updates } = data;
  return updates.reduce((acc, update) => {
    return (
      acc +
      (rules.every((rule) => updateSatisfiesOrderingRule(update, rule))
        ? getMiddlePageNumber(update)
        : 0)
    );
  }, 0);
};

export { solvePart1 };

const part1Total = await solvePart1();
console.log(`Middle pages of correct inputs sum to ${part1Total}.`);
