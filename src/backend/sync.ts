import { promises as fs } from "fs";

let lockTaskDict = new Map<string, Promise<fs.FileHandle>>();

async function lock(key: string) {
  if (lockTaskDict.has(key)) return lockTaskDict.get(key)!;
  const task = (async () => {
    while (true) {
      const lockFilePath = `/tmp/${key}.lock`;
      try {
        const fp = await fs.open(lockFilePath, "wx");
        return fp;
      } catch (e) {
        const err = e as NodeJS.ErrnoException;
        if (err.code !== "EEXIST") throw e;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  })();
  lockTaskDict.set(key, task);
  return task;
}

async function unlock(fp: fs.FileHandle, key: string) {
  await fp.close();
  try {
    await fs.unlink(`/tmp/${key}.lock`);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") throw e;
  }
}

export async function lockedTask(key: string, task: () => Promise<any>) {
  const fp = await lock(key);
  try {
    return await task();
  } finally {
    await unlock(fp, key);
  }
}
