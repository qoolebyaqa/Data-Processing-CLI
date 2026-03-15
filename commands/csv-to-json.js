import fs from "fs";
import path from "path";
import { Transform, pipeline } from "stream";
import { promisify } from "util";

const pipe = promisify(pipeline);

export async function csvToJson(args) {
  try {
    const inputIndex = args.indexOf("--input");
    const outputIndex = args.indexOf("--output");

    if (inputIndex === -1 || outputIndex === -1) {
      throw new Error();
    }

    const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);
    const outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);

    if (!fs.existsSync(inputPath)) {
      throw new Error();
    }

    const readStream = fs.createReadStream(inputPath, { encoding: "utf8" });
    const writeStream = fs.createWriteStream(outputPath);

    let headers = null;
    let isFirst = true;
    let buffer = "";

    const transform = new Transform({
      transform(chunk, enc, cb) {
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