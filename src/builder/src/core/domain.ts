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

function getVersionFromName(name: string) {
  return name.split(".")[0];
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
    const mdFiles: File[] = [];
    const others: (File | Directory)[] = [];
    files.children.forEach((child) => {
      if ("children" in child) others.push(child);
      else if (child.name.endsWith(".md")) mdFiles.push(child);
      else others.push(child);
    });
    files.children = others;

    // Create version and replace md files to html
    const versionedData: PostVersionedData[] = [];
    let tags: string[] = [];
    let date: string = "";
    mdFiles.forEach((mdFile) => {
      const md = mdFile.data.toString();
      const parsed = this.postParser.parse(md);
      versionedData.push({
        version: getVersionFromName(mdFile.name),
        title: parsed.title,
        md: md,
        html: parsed.html,
      });

      // Set tags
      if (tags.length === 0) tags = parsed.tags;
      else if (tags.join(",") !== parsed.tags.join(","))
        throw new Error("Tags are different between versions");

      // Set date
      if (!parsed.date) throw new Error(`Date is not found in ${mdFile.name}`);
      if (date === "") date = parsed.date;
      else if (date !== parsed.date)
        throw new Error("Date is different between versions");
    });

    // Get supported versions
    const supportedVersions = versionedData.map((d) => d.version).sort();

    return {
      id: postDir.name,
      date,
      tags,
      versions: versionedData,
      availableVersions: supportedVersions,
      files,
    };
  }
}
