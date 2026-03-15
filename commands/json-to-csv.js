import fs from "fs";
import path from "path";
import { Transform, pipeline } from "stream";
import { promisify } from "util";

const pipe = promisify(pipeline);

export async function jsonToCsv(rl, args) {
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