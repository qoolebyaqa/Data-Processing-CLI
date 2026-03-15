import path from "path";

export function pathResolver(targetPath) {
  targetPath = targetPath.replace(/^([a-z]):/, (_m, d) => d.toUpperCase() + ':');
  if (path.isAbsolute(targetPath)) {
    process.chdir(targetPath);
  } else {
    process.chdir(path.resolve(process.cwd(), targetPath));
  }
}
