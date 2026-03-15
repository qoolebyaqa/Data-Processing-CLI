import { pathResolver } from "./utils/pathResolver.js";
import path from "path";
import fs from "fs/promises";

export function up() {
  process.chdir(path.resolve(process.cwd(), ".."));
}

export function cd(args) {
  const targetPath = args[0].replace(/^['"]|['"]$/g, '');
  if (targetPath) {
    try {
      pathResolver(targetPath);
      console.log( `Changed directory to ${process.cwd()}` );
    } catch (error) {
      console.log("Operation failed");
    }
  } else {
    console.log("cd: missing argument");
  }
}

export async function ls() {
  try {
    const files = await fs.readdir(process.cwd());
    const stats = await Promise.all(files.map(file => fs.stat(path.join(process.cwd(), file))));
    const folders = [];
    const regularFiles = [];
    files.forEach((file, index) => {
      if (stats[index].isDirectory()) {
        folders.push(file);
      } else {
        regularFiles.push(file);
      }
    });
    folders.sort();
    regularFiles.sort();
    folders.forEach(file => {
      console.log(`${file}    [folder]`);
    });
    regularFiles.forEach(file => {
      console.log(`${file}    [file]`);
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}