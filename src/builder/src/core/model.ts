// Post parser

/**
 * 하나의 post directory 안에 여러 언어 버전이 있을 수가 있다.
 * 그 경우 모델링은 어떻게 할 것인가?
 * ==> Post parser는 단지 post md파일 하나만을 파싱하는 것이 옳다.
 * 최소한의 책임만 가진다. (SRP)
 */

export interface PostParserResult {
  title: string;
  tags: string[];
  date: string | null;
  markdown: string;
  html: string;
}

export interface PostParser {
  parse(md: string): PostParserResult;
  dump(result: PostParserResult): string;
}

// Blog service

export interface File {
  name: string;
  data: Buffer;
}

export interface Directory {
  name: string;
  children: (File | Directory)[];
}

export interface PostVersionedData {
  version: string;
  title: string;
  md: string;
  html: string;
}

export interface Post {
  id: string;
  date: string;
  tags: string[];
  versions: PostVersionedData[];
  supportedVersions: string[];
  files: Directory;
}

export interface VersionedPost {
  id: string;
  version: string;
  title: string;
  date: string;
  tags: string[];
  html: string;
  md: string;
}

export interface Fix {
  path: string[];
  value: string;
}

export interface BlogService {
  fixPost(postDir: Directory): Fix[];
  parsePost(postDir: Directory): Post;
}
