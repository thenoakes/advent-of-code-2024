import { createReadStream } from "fs";
import { once } from "events";
import { createInterface } from "readline";

interface Processor {
  (line: string): void;
}

export default async function processInput(
  fileName: string,
  processor: Processor,
) {
  const reader = createInterface({
    input: createReadStream(fileName),
  });
  reader.on("line", processor);
  await once(reader, "close");
}
