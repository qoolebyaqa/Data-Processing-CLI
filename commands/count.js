import fs from "fs";
import path from "path";

export function count(args) {
  try {
    const inputIndex = args.indexOf("--input");

    if (inputIndex === -1) {
      throw new Error();
    }

    const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);

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