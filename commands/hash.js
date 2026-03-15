import fs from "fs";
import crypto from "crypto";
import { pathResolver } from "../utils/pathResolver.js";
import { argParser } from "../utils/argParser.js";

export async function hash(args) {
  try {
    const argsObj = argParser(args);

    if (!argsObj["input"] || !argsObj["hash"]) {
      throw new Error();
    }

    const inputPath = pathResolver(argsObj["input"]);
    const hashPath = pathResolver(argsObj["hash"]);

    const algorithm = argsObj["algorithm"]
      ? argsObj["algorithm"].toLowerCase()
      : "sha256";

    const supported = ["sha256", "md5", "sha512"];

    if (!supported.includes(algorithm)) {
      throw new Error();
    }

    if (!fs.existsSync(inputPath) || !fs.existsSync(hashPath)) {
      throw new Error();
    }

    const expectedHash = fs.readFileSync(hashPath, "utf8")
      .trim()
      .toLowerCase();

    const hash = crypto.createHash(algorithm);

    const readStream = fs.createReadStream(inputPath);

    readStream.on("data", (chunk) => {
      hash.update(chunk);
    });

    readStream.on("end", () => {

      const calculated = hash.digest("hex").toLowerCase();

      if (calculated === expectedHash) {
        console.log("OK");
      } else {
        console.log("MISMATCH");
      }

    });

    readStream.on("error", () => {
      console.log("Operation failed");
    });

  } catch {
    console.log("Operation failed");
  }
}