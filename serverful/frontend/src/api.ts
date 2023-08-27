import { PostMetadata } from "./App";

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
}
