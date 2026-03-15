import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export async function encrypt(args) {
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