import { execSync } from "child_process";
import { renameSync, mkdirSync, existsSync } from "fs";

const extension = process.platform === "win32" ? ".exe" : "";

const rustInfo = execSync("rustc -vV");
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error("Failed to determine platform target triple");
}
const projectName = process.argv[2];
if (!existsSync("src-tauri/embedded/bin")) {
  mkdirSync("src-tauri/embedded/bin");
}
renameSync(
  `src-tauri/embedded/workspace/${projectName}/${projectName}${extension}`,
  `src-tauri/embedded/bin/${projectName}-${targetTriple}${extension}`,
);
