export type Setting = {
  root: string;
  dst: string;
  publicDir: string;
  jsxFile: string;
  tocFile: string;
};

export type PostDict = { [key: string]: PostMeta };

export type Categories = { [key: string]: { count: number } };

export type BlogMeta = {
  posts: PostDict;
  categories: Categories;
  setting: Setting;
  postOrder: string[];
};

export type PostMeta = {
  name: string;
  date: Date;
  category: string;
  order: number;
};
