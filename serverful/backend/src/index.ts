import koa from "koa";
import Router from "@koa/router";
import { BlogService } from "./core";
import path from "path";
// import morgan from "morgan"

const postPath = path.join(__dirname, "..", "..", "..", "posts");

async function main() {
  const blogService = await BlogService.create(postPath);

  const router = new Router();

  router.get("/api", async (ctx) => {
    ctx.body = "Hello World";
  });

  router.get("/api/posts", async (ctx) => {
    const posts = await blogService.getPostMetadata();
    ctx.body = posts;
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
