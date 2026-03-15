import fs from "fs";
import { Transform, pipeline } from "stream";
import { promisify } from "util";
import { pathResolver } from "../utils/pathResolver.js";
import { argParser } from "../utils/argParser.js";

const pipe = promisify(pipeline);

export async function jsonToCsv(args) {
  try {
    const argsObj = argParser(args);

      if (!argsObj["input"] || !argsObj["output"]) {
      throw new Error();
    }

    const inputPath = pathResolver(argsObj["input"]);
    const outputPath = pathResolver(argsObj["output"]);
    if (!fs.existsSync(inputPath)) {
      throw new Error();
    }

    const readStream = fs.createReadStream(inputPath, { encoding: "utf8" });
    const writeStream = fs.createWriteStream(outputPath);

    let buffer = "";

    const transform = new Transform({
      transform(chunk, enc, cb) {
        buffer += chunk;
        cb();
      },

      flush(cb) {
        try {
          const data = JSON.parse(buffer);

          if (!Array.isArray(data) || data.length === 0) {
            throw new Error();
          }

          const headers = Object.keys(data[0]);
          let result = headers.join(",") + "\n";

          for (const obj of data) {
            const row = headers.map((h) => obj[h] ?? "").join(",");
            result += row + "\n";
          }

          this.push(result);
          cb();
        } catch {
          cb(new Error());
        }
      },
    });

    await pipe(readStream, transform, writeStream);

  } catch {
    console.log("Operation failed");
  }
}