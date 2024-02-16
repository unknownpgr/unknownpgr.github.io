export interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  html: string;
  files: { [key: string]: Buffer };
}

export interface PostSummary {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

// Post parser

export interface PostParserParam {
  files: { [key: string]: Buffer };
}

export interface PostParserResult {
  title: string;
  tags: string[];
  date: string;
  html: string;
  files: { [key: string]: Buffer };
  markdownFilename: string;
  updatedMarkdown: string;
}

export interface PostParser {
  parse(param: PostParserParam): Promise<PostParserResult>;
}

// DTO

export interface PostDTO {
  id: string;
  title: string;
  date: string;
  tags: string[];
  html: string;
  adjacentPosts: {
    previous: PostSummary | null;
    next: PostSummary | null;
  };
}
