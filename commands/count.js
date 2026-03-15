import fs from "fs";
import { argParser } from "../utils/argParser.js";
import { pathResolver } from "../utils/pathResolver.js";

export async function count(args) {
  try {
    const argsObj = argParser(args);

    if (!argsObj["input"]) {
      throw new Error();
    }

    const inputPath = pathResolver(argsObj["input"]);

    if (!fs.existsSync(inputPath)) {
      throw new Error();
    }

    const readStream = fs.createReadStream(inputPath, { encoding: "utf8" });

    let lines = 0;
    let words = 0;
    let characters = 0;

    let leftover = "";

    readStream.on("data", (chunk) => {

      characters += chunk.length;

      const text = leftover + chunk;
      const parts = text.split(/\s+/);

      leftover = parts.pop();

      words += parts.filter(Boolean).length;

      const lineMatches = chunk.match(/\n/g);
      if (lineMatches) lines += lineMatches.length;
    });

    readStream.on("end", () => {

      if (leftover.trim()) {
        words++;
      }

      console.log(`Lines: ${lines}`);
      console.log(`Words: ${words}`);
      console.log(`Characters: ${characters}`);
    });

    readStream.on("error", () => {
      console.log("Operation failed");
    });

  } catch {
    console.log("Operation failed");
  }
}