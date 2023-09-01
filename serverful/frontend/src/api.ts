import { PostData, PostMetadata } from "./pages/main";

export class ApiService {
  constructor(private baseUrl: string = "") {}

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
    }
    return res.json();
  }

  public async getPosts(): Promise<PostMetadata[]> {
    return await this.request<PostMetadata[]>("/api/posts");
  }

  public async getPost(id: string): Promise<PostData> {
    return await this.request<PostData>(`/api/posts/${id}`);
  }
}
