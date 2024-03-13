import { BlogApplication } from "./application";
import { BlogServiceImpl } from "./core/domain";
import { OnMemoryPostParser } from "./parser";

async function main() {
  const parser = new OnMemoryPostParser();
  const blogService = new BlogServiceImpl(parser);
  const app = new BlogApplication(blogService);

  await app.fixAllPosts();
  await app.compilePosts();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
