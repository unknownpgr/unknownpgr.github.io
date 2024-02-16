import { Post, PostSummary } from "./model";

export class ApiService {
  constructor(private baseUrl: string = "") {}

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
    }
    return res.json();
  }

  public async getPosts(): Promise<PostSummary[]> {
    return await this.request<PostSummary[]>("/api/posts");
  }

  public async getPost(id: string): Promise<Post> {
    return await this.request<Post>(`/api/posts/${id}`);
  }
}
