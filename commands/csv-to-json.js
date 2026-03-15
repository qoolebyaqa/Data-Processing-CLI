import fs from "fs";
import { Transform, pipeline } from "stream";
import { promisify } from "util";
import { pathResolver } from "../utils/pathResolver.js";
import { argParser } from "../utils/argParser.js";

const pipe = promisify(pipeline);

export async function csvToJson(args) {
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

    let headers = null;
    let isFirst = true;
    let buffer = "";

    const transform = new Transform({
      transform(chunk, _enc, cb) {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop();

        let result = "";

        for (const line of lines) {
          if (!line.trim()) continue;

          if (!headers) {
            headers = line.split(",");
            result += "[\n";
            continue;
          }

          const values = line.split(",");
          const obj = {};

          headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim() ?? "";
          });

          if (!isFirst) result += ",\n";
          result += JSON.stringify(obj, null, 2);
          isFirst = false;
        }

        cb(null, result);
      },

      flush(cb) {
        let result = "";

        if (buffer && headers) {
          const values = buffer.split(",");
          const obj = {};

          headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim() ?? "";
          });

          if (!isFirst) result += ",\n";
          result += JSON.stringify(obj, null, 2);
        }

        result += "\n]\n";
        cb(null, result);
      },
    });

    await pipe(readStream, transform, writeStream);
  } catch {
    console.log("Operation failed");
  }
}