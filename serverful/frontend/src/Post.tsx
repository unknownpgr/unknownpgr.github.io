import { useEffect, useState } from "react";
import { PostData } from "./App";
import { ApiService } from "./api";
import { useParams } from "react-router-dom";

const api = new ApiService();

export function Post() {
    const [post, setPost] = useState<PostData | null>(null);
    const postId = useParams<{ id: string }>().id;

    useEffect(() => {
        if (!postId) {
            return;
        }
        const fetchPost = async () => {
            const post = await api.getPost(postId);
            setPost(post);
        }
        fetchPost();
    }, [postId]);

    if (!post) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>{
                post.title
            }
            </h1>
            <p>
                {
                    post.date
                }
            </p>
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
    )
}