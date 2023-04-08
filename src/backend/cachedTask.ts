import { promises as fs } from "fs";
import path from "path";
import { lockedTask } from "./sync";

const CACHE_DIR = `.cache`;
const taskStore = new Map<string, Promise<any>>();

export function cache(key: string, onMiss: () => Promise<any>) {
  if (taskStore.has(key)) return taskStore.get(key);
  const task = lockedTask(key, async () => {
    try {
      await fs.mkdir(CACHE_DIR);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "EEXIST") throw e;
    }
    const cacheFilePath = path.join(CACHE_DIR, key);
    try {
      const cache = await fs.readFile(cacheFilePath, "utf-8");
      return JSON.parse(cache);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") throw e;
      const result = await onMiss();
      await fs.writeFile(cacheFilePath, JSON.stringify(result));
      return result;
    }
  });
  taskStore.set(key, task);
  return task;
}
