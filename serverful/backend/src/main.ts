import koa from "koa";
import Router from "@koa/router";
import { BlogService } from "./core";
import path from "path";
import mime from "mime-types";
// import morgan from "morgan"

const postPath = path.join(__dirname, "..", "..", "..", "posts");

async function main() {
  const blogService = await BlogService.create(postPath);

  const router = new Router();

  router.get("/api", async (ctx) => {
    ctx.body = "Hello World";
  });

  router.get("/api/posts", async (ctx) => {
    const posts = await blogService.getPostsMetadata();
    ctx.body = posts;
  });

  router.get("/api/posts/:id", async (ctx) => {
    const post = await blogService.getPost(ctx.params.id);
    post.fileMapping = {};
    const adjustedPosts = await blogService.getAdjacentPosts(ctx.params.id);
    ctx.body = { post, adjustedPosts };
  });

  router.get("/api/files/:id", async (ctx) => {
    const file = await blogService.getFile(ctx.params.id);
    const type = mime.lookup(ctx.params.id);
    if (type) ctx.set("Content-Type", type);
    ctx.body = file;
  });

  router.get("/api/sitemap.xml", async (ctx) => {
    const sitemap = await blogService.getSitemap();
    ctx.set("Content-Type", "application/xml");
    ctx.set("Content-Encoding", "gzip");
    ctx.body = sitemap;
  });

  const app = new koa();
  app.use(router.routes());
  app.listen(80, () => {
    console.log("Listening on port 80");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});