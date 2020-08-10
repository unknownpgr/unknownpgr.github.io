const fs = require("fs").promises;
const util = require("util");
const sharp = require("sharp");
const path = require("path");
import { Setting } from "./config";

/**
 * @param {*} meta Post metadata
 * @param {String} img Name of image file(without path)
 * @param {Number} dstWidth Desired width of thumbnail image
 * @param {Number} dstHeight Desired height of thumbnail image
 */
async function createThumbnail(
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
    await fs.mkdir(dir);
  } catch {}
  await sharp(src).resize(dstWidth, dstHeight).toFile(dst);
  return path.relative(dir, dst);
}

module.exports = createThumbnail;
