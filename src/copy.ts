import { existsSync } from "fs";
import { copyFile, rm } from "fs/promises";
import { join, resolve } from "path";

export async function copyZVMSSqliteDatabase() {
  const src = join(
    "C:",
    "Users",
    "public",
    "workspace",
    "zvms-bootstrap",
    "instance",
    "zvms.db"
  );
  const dest = resolve("database", "zvms.db");
  if (existsSync(dest)) {
    await rm(dest);
  }
  return await copyFile(src, dest);
}
