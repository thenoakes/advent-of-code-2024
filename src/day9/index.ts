import { resolve } from "path";
import { fileURLToPath } from "url";

import processInput from "../lib/processor";

const inputPath = resolve(fileURLToPath(import.meta.url), "..", "input.txt");

const { log } = console;

type FreeBlock = { kind: "free" };
type FileBlock = { kind: "file"; fileId: number };
type Block = FreeBlock | FileBlock;
const isFree = (block: Block): block is FreeBlock => block.kind === "free";

const getData = async () => {
  const blockCounts = <number[]>[];
  await processInput(inputPath, (line) => {
    const digits = Array.from(line).map((char) => parseInt(char, 10));
    blockCounts.push(...digits);
  });

  const blocks = blockCounts.reduce<Block[]>((acc, count, idx) => {
    const isFile = idx % 2 === 0;
    if (isFile) {
      return acc.concat(Array(count).fill({ kind: "file", fileId: idx / 2 }));
    } else {
      return acc.concat(Array(count).fill({ kind: "free" }));
    }
  }, []);

  log(`Input processed. End index is ${blocks.length - 1}`);
  return blocks;
};

const isCompact = (blocks: Block[]) => {
  const firstFreeBlock = blocks.findIndex(isFree);
  return blocks.slice(firstFreeBlock).every(isFree);
};

const process = (blocks: Block[]) => {
  const firstFreeBlockIndex = blocks.findIndex(isFree);
  const lastFileBlockIndex =
    blocks.length -
    blocks.toReversed().findIndex((block) => !isFree(block)) -
    1;
  const lastFileBlock = blocks.at(lastFileBlockIndex)!;

  const processed = [...blocks];
  processed.splice(firstFreeBlockIndex, 1, lastFileBlock);
  processed.splice(lastFileBlockIndex, 1, { kind: "free" });

  const compact = isCompact(processed);

  return { isCompact: compact, blocks: processed };
};

const solvePart1 = async () => {
  let blocks = await getData();
  let isCompact = false;

  while (!isCompact) {
    const result = process(blocks);
    blocks = result.blocks;
    isCompact = result.isCompact;
  }

  const checksum = blocks.reduce(
    (acc, block, idx) => acc + idx * (isFree(block) ? 0 : block.fileId),
    0,
  );

  return checksum;
};

const part1 = await solvePart1();
log(`Checksum is ${part1}`);

export { solvePart1 };
