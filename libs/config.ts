type Setting = {
  root: string;
  dst: string;
  publicDir: string;
  jsxFile: string;
  tocFile: string;
};

type PostDict = { [key: string]: PostMeta };

type Categories = { [key: string]: { count: number } };

type BlogMeta = {
  posts: PostDict;
};

type PostMeta = {
  name: string;
  date: Date;
  category: string;
  order: number;
};
