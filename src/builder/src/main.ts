import { BlogApplication } from "./application";
import { BlogServiceImpl } from "./core/domain";
import { OnMemoryPostParser } from "./parser";
import { BlogTemplateImpl } from "./template";

async function main() {
  const parser = new OnMemoryPostParser();
  const blogService = new BlogServiceImpl(parser);
  const template = new BlogTemplateImpl();
  const app = new BlogApplication(blogService, template, {
    host: "https://unknownpgr.com",
    outputDir: "../../static",
  });

  await app.fixAllPosts();
  await app.compilePosts();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
