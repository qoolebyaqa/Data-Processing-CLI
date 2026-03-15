import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { pathResolver } from "../utils/pathResolver.js";
import { argParser } from "../utils/argParser.js";

export async function encrypt(args) {
  try {
    const argsObj = argParser(args);

    if (!argsObj["input"] || !argsObj["output"] || !argsObj["password"]) {
      throw new Error();
    }

    const inputPath = pathResolver(argsObj["input"]);
    const outputPath = pathResolver(argsObj["output"]);
    const password = argsObj["password"];

    if (!fs.existsSync(inputPath)) {
      throw new Error();
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);

    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(
      readStream,
      cipher,
      writeStream
    );

    const authTag = cipher.getAuthTag();
    fs.appendFileSync(outputPath, authTag);

  } catch {
    console.log("Operation failed");
  }
}