export interface IPostMetadata {
  name: string;
  title: string;
  date: string;
  category: string;
}

export interface IPost extends IPostMetadata {
  html: string;
}

export interface ICategory {
  name: string;
  postsNumber: number;
}
