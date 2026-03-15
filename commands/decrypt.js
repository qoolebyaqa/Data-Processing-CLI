import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { pathResolver } from "../utils/pathResolver.js";
import { argParser } from "../utils/argParser.js";

export async function decrypt(args) {
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

    const stat = fs.statSync(inputPath);
    const fileSize = stat.size;

    const fd = fs.openSync(inputPath, "r");

    const header = Buffer.alloc(28);
    fs.readSync(fd, header, 0, 28, 0);

    const salt = header.subarray(0, 16);
    const iv = header.subarray(16, 28);

    const authTag = Buffer.alloc(16);
    fs.readSync(fd, authTag, 0, 16, fileSize - 16);

    fs.closeSync(fd);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const readStream = fs.createReadStream(inputPath, {
      start: 28,
      end: fileSize - 17
    });

    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(
      readStream,
      decipher,
      writeStream
    );

  } catch {
    console.log("Operation failed");
  }
}