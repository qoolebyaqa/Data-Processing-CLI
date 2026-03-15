import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export async function decrypt(args) {
  try {

    const inputIndex = args.indexOf("--input");
    const outputIndex = args.indexOf("--output");
    const passwordIndex = args.indexOf("--password");

    if (inputIndex === -1 || outputIndex === -1 || passwordIndex === -1) {
      throw new Error();
    }

    const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);
    const outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
    const password = args[passwordIndex + 1];

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