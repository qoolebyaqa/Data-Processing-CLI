import path from "path";

export function pathResolver(targetPath) {
  targetPath = targetPath.replace(/^([a-z]):/, (_m, d) => d.toUpperCase() + ':');

  return path.isAbsolute(targetPath) ? path.resolve(targetPath) : path.resolve(process.cwd(), targetPath);
}
