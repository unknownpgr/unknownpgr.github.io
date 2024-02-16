import koa from "koa";
import Router from "@koa/router";
import { BlogService } from "./core";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import crypto from "crypto";
import auth from "koa-basic-auth";
import logger from "koa-logger";
dotenv.config();

const POST_PATH = process.env.POST_PATH || path.join("/", "posts");
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");

async function main() {
  const blogService = await BlogService.create(POST_PATH);

  const publicRouter = new Router();

  publicRouter.get("/api", async (ctx) => {
    ctx.body = "Hello World";
  });

  publicRouter.get("/api/posts", async (ctx) => {
    const posts = await blogService.getPostList();
    ctx.body = posts;
  });

  publicRouter.get("/api/posts/:id", async (ctx) => {
    const post = await blogService.getPost(ctx.params.id);
    ctx.body = post;
  });

  publicRouter.get("/api/files/:id", async (ctx) => {
    const file = await blogService.getFile(ctx.params.id);
    const type = mime.lookup(ctx.params.id);
    if (type) ctx.set("Content-Type", type);
    ctx.body = file;
  });

  publicRouter.get("/api/sitemap.xml", async (ctx) => {
    const sitemap = await blogService.getSitemap();
    ctx.set("Content-Type", "application/xml");
    ctx.set("Content-Encoding", "gzip");
    ctx.body = sitemap;
  });

  const privateRouter = new Router();

  privateRouter.use(async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      if (err.status === 401) {
        ctx.status = 401;
        ctx.set("WWW-Authenticate", "Basic");
        ctx.body = "Unauthorized";
      } else throw err;
    }
  });

  privateRouter.use(auth({ name: ADMIN_USERNAME, pass: ADMIN_PASSWORD }));

  privateRouter.get("/api/login", async (ctx) => {
    ctx.body = "Login successful";
  });

  privateRouter.get("/api/cache-clear", async (ctx) => {
    ctx.body = "Cache cleared";
  });

  const app = new koa();
  app.use(logger());
  app.use(publicRouter.routes());
  app.use(privateRouter.routes());
  app.listen(80, () => {
    console.log("Listening on port 80");
    console.log(`Admin username: ${ADMIN_USERNAME}`);
    console.log(`Admin password: ${ADMIN_PASSWORD}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
