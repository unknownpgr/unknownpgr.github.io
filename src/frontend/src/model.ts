export interface Post {
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

export interface PostSummary {
  id: string;
  title: string;
  date: string;
  tags: string[];
}
