import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

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

const { rules, updates } = await getData();

const ruleApplies = (update: number[], [first, second]: OrderingRule) =>
  update.includes(first) && update.includes(second);

const ruleSatisfied = (update: number[], [first, second]: OrderingRule) =>
  update.indexOf(first) < update.indexOf(second);

const updateOk = (update: number[], rule: OrderingRule) =>
  !ruleApplies(update, rule) || ruleSatisfied(update, rule);

const getMiddlePage = (update: number[]) => update[(update.length - 1) / 2];

const solvePart1 = async () => {
  const correctUpdates = updates.filter((update) =>
    rules.every((rule) => updateOk(update, rule)),
  );

  return correctUpdates.reduce((acc, update) => acc + getMiddlePage(update), 0);
};

/** Map each page in the update together with a Set of the pages that must come AFTER it. */
const getRuleMap = (update: number[]) =>
  rules
    .filter((rule) => ruleApplies(update, rule))
    .reduce(
      (acc, [first, second]) => {
        // Associate the second page with the first, indicating that the second must follow the first
        acc.get(first)?.add(second);
        return acc;
      },
      new Map(update.map((u) => [u, new Set<number>()])),
    );

const solvePart2 = async () => {
  const incorrectUpdates = updates.filter((update) =>
    rules.some((rule) => !updateOk(update, rule)),
  );

  const reOrdered = incorrectUpdates.map((update) => {
    const relevantRules = Array.from(getRuleMap(update).entries()).filter(
      ([first]) => update.includes(first),
    );

    return relevantRules
      .toSorted((a, b) => b[1].size - a[1].size)
      .map(([first]) => first);
  });

  return reOrdered.reduce((acc, x) => acc + getMiddlePage(x), 0);
};

export { solvePart1, solvePart2 };

const part1Total = await solvePart1();
console.log(`Middle pages of correct inputs sum to ${part1Total}.`);

const part2Total = await solvePart2();
console.log(`Middle pages of re-ordered inputs sum to ${part2Total}.`);
