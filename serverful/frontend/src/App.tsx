import { useEffect, useState } from "react";
import { ApiService } from "./api";

export interface PostMetadata {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

export interface PostData extends PostMetadata {
  html: string;
}

const api = new ApiService();

function App() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await api.getPosts();
      setPosts(posts);
    }
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <a href={`/posts/${post.id}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
