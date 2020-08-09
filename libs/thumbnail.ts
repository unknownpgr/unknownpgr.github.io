import fs from "fs";
import util from "util";
import sharp from "sharp";
import path from "path";
import { Setting } from "./config";

const mkdir = util.promisify(fs.mkdir);

/**
 * @param {*} meta Post metadata
 * @param {String} img Name of image file(without path)
 * @param {Number} dstWidth Desired width of thumbnail image
 * @param {Number} dstHeight Desired height of thumbnail image
 */
export async function createThumbnail(
  setting: Setting,
  meta: any,
  img: string,
  dstWidth?: number,
  dstHeight: number = 300
) {
  let dir = path.join(setting.publicDir, "thumbnails");
  let src = path.join(setting.root, "posts", meta.name, img);
  let dst = path.join(dir, `thm_${meta.name}.png`);
  try {
    await mkdir(dir);
  } catch {}
  await sharp(src).resize(dstWidth, dstHeight).toFile(dst);
  return path.relative(dir, dst);
}
