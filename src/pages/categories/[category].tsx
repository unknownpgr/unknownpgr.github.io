import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { getPostsMetadata } from "../../backend";
import Posts from "../../components/Posts";
import { IPostMetadata } from "../../types";

export const getStaticPaths: GetStaticPaths = async () => {
  const { categories } = await getPostsMetadata();
  const paths: { params: { category: string } }[] = [];
  categories.forEach(({ name }) => {
    paths.push({
      params: { category: name },
    });
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  category: string;
  posts: IPostMetadata[];
}> = async (context) => {
  const category = context.params?.category;
  if (typeof category !== "string") {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  const { posts: _posts } = await getPostsMetadata();
  const posts = _posts.filter((post) => post.category === category);
  return {
    props: { category, posts },
  };
};

export default function Category({
  category,
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <h1>Posts in {category}</h1>
      <Posts posts={posts}></Posts>
    </div>
  );
}
