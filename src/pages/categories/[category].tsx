import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { getPostsMetadata } from "../../backend";
import Posts from "../../components/Posts";
import { Category, PostMetadata } from "../../types";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPostsMetadata();
  const categories = posts.reduce((acc, post) => {
    const { category } = post;
    const categoryObject = acc.find((c) => c.name === category);
    if (categoryObject) {
      categoryObject.postsNumber++;
      return acc;
    }
    return [...acc, { name: category, postsNumber: 1 }];
  }, [] as Category[]);
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
  posts: PostMetadata[];
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
  let posts = await getPostsMetadata();
  posts = posts.filter((post) => post.category === category);
  return {
    props: { category, posts },
  };
};

export default function CategoryView({
  category,
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <div>
        <i>Posts in {category}</i>
      </div>
      <br></br>
      <Posts posts={posts}></Posts>
    </div>
  );
}
