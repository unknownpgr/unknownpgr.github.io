import {
  BlogService,
  Directory,
  File,
  Fix,
  Post,
  PostParser,
  PostVersionedData,
} from "./model";

function cloneFile(file: File): File {
  return { ...file };
}

function cloneDirectory(dir: Directory): Directory {
  return {
    name: dir.name,
    children: dir.children.map((child) => {
      if ("children" in child) return cloneDirectory(child);
      return cloneFile(child);
    }),
  };
}

export class BlogServiceImpl implements BlogService {
  constructor(private postParser: PostParser) {}

  fixPost(postDir: Directory): Fix[] {
    const now = new Date().toISOString();
    const fixes: Fix[] = [];
    const mdFiles = postDir.children.filter((child) => {
      if ("children" in child) return false;
      return child.name.endsWith(".md");
    }) as File[];
    mdFiles.forEach((mdFile) => {
      const md = mdFile.data.toString();
      const parsed = this.postParser.parse(md);
      const fixedMd = this.postParser.dump({
        ...parsed,
        date: parsed.date || now,
      });
      if (fixedMd == md) return;
      fixes.push({ path: [mdFile.name], value: fixedMd });
    });
    return fixes;
  }

  parsePost(postDir: Directory): Post {
    const files = cloneDirectory(postDir);

    // Find markdown files
    const mdFiles = files.children.filter((child) => {
      if ("children" in child) return false;
      return child.name.endsWith(".md");
    }) as File[];
    if (mdFiles.length === 0) throw new Error("No markdown file found");

    // Create version and replace md files to html
    const versions: PostVersionedData[] = [];
    let tags: string[] = [];
    let date: string = "";
    mdFiles.forEach((mdFile) => {
      const md = mdFile.data.toString();
      const parsed = this.postParser.parse(md);
      versions.push({
        version: mdFile.name,
        title: parsed.title,
        md: md,
        html: parsed.html,
      });
      if (tags.length === 0) tags = parsed.tags;
      else if (tags.join(",") !== parsed.tags.join(","))
        throw new Error("Tags are different between versions");
      if (!parsed.date) throw new Error(`Date is not found in ${mdFile.name}`);
      if (date === "") date = parsed.date;
      else if (date !== parsed.date)
        throw new Error("Date is different between versions");
      mdFile.name = mdFile.name.replace(/\.md$/, ".html");
      mdFile.data = Buffer.from(parsed.html);
    });

    let mainVersion = versions.find((version) =>
      version.version.includes("ko")
    );
    if (!mainVersion) mainVersion = versions[0];

    return {
      id: postDir.name,
      date,
      tags,
      versions,
      mainVersion: mainVersion.version,
      files,
    };
  }
}
