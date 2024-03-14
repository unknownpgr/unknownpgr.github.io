import fs from "fs";
import path from "path";
import { BlogTemplate } from "./application";

export class BlogTemplateImpl implements BlogTemplate {
  private readonly mainTemplate: string;
  private readonly postTemplate: string;

  private readonly head: string;
  private readonly footer: string;

  constructor() {
    const templatePath = path.join(__dirname, "templates");

    this.mainTemplate = fs.readFileSync(
      path.join(templatePath, "main.html"),
      "utf-8"
    );
    this.postTemplate = fs.readFileSync(
      path.join(templatePath, "post.html"),
      "utf-8"
    );
    this.head = fs.readFileSync(path.join(templatePath, "head.html"), "utf-8");
    this.footer = fs.readFileSync(
      path.join(templatePath, "footer.html"),
      "utf-8"
    );
  }

  private static render(
    template: string,
    data: { [key: string]: string }
  ): string {
    let result = template;
    for (const key in data) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
    }
    return result;
  }

  private renderDefault(
    template: string,
    data: { [key: string]: string }
  ): string {
    let result = template;
    result = BlogTemplateImpl.render(result, {
      head: this.head,
      footer: this.footer,
    });
    result = BlogTemplateImpl.render(result, data);
    return result;
  }

  public renderMain(data: { [key: string]: string }): string {
    return this.renderDefault(this.mainTemplate, data);
  }

  public renderPost(data: { [key: string]: string }): string {
    return this.renderDefault(this.postTemplate, data);
  }
}
