export interface PostMetadata {
  name: string;
  title: string;
  date: string;
  category: string;
}

export interface Post extends PostMetadata {
  html: string;
}

export interface Category {
  name: string;
  postsNumber: number;
}
