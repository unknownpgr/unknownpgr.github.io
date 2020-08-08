const fs = require("fs");
const util = require("util");
const sharp = require("sharp");
const path = require("path");
const mkdir = util.promisify(fs.mkdir);

/**
 * @param {*} meta Post metadata
 * @param {String} img Name of image file(without path)
 * @param {Number} dstWidth Desired width of thumbnail image
 * @param {Number} dstHeight Desired height of thumbnail image
 */
async function createThumbnail(
  setting,
  meta,
  img,
  dstWidth = undefined,
  dstHeight = 300
) {
  let dir = path.join(setting.public, "thumbnails");
  let src = path.join(setting.root, "posts", meta.name, img);
  let dst = path.join(dir, `thm_${meta.name}.png`);
  try {
    await mkdir(dir);
  } catch {}
  await sharp(src).resize(dstWidth, dstHeight).toFile(dst);
  return path.relative(dir, dst);
}

module.exports = createThumbnail;
