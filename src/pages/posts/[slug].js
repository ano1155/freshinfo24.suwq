import Link from "next/link";
import Head from "next/head";
import { Helmet } from "react-helmet";

import { parse } from 'node-html-parser';
import usePageMetadata from "hooks/use-page-metadata";
import useSite from "hooks/use-site";
import { categoryPathBySlug } from "lib/categories";
import { formatDate } from "lib/datetime";
import { ArticleJsonLd } from "lib/json-ld";
import {
  getPostBySlug,
  getRecentPosts,
  getRelatedPosts,
  postPathBySlug,
} from "lib/posts";
import { helmetSettingsFromMetadata } from "lib/site";

import Container from "components/Container";
import Content from "components/Content";
import FeaturedImage from "components/FeaturedImage";
import Header from "components/Header";
import Layout from "components/Layout";
import Metadata from "components/Metadata";
import Section from "components/Section";

import styles from "styles/pages/Post.module.scss";

export default function Post({ post, socialImage, related }) {
  const {
    title,
    metaTitle,
    description,
    content,
    featuredImage,
    slug,
    isSticky = false,
  } = post;

  const { metadata: siteMetadata = {}, homepage } = useSite();

  if (!post.og) {
    post.og = {};
  }

  // version with wordpress for image

  const ogImageUrl = post.featuredImage?.sourceUrl;


  
  // version with vercel for image

  // const ogImageUrl =
  //   process.env.VERCEL_DOMAIN +
  //   "api" +
  //   (post.featuredImage?.sourceUrl &&
  //     new URL(post.featuredImage?.sourceUrl)?.pathname); // `${homepage}${socialImage}`;

  post.og.imageUrl = ogImageUrl;
  post.og.imageSecureUrl = ogImageUrl;
  post.og.imageWidth = 2000;
  post.og.imageHeight = 1000;

  const { metadata } = usePageMetadata({
    metadata: {
      ...post,
      title: metaTitle,
      description:
        description || post.og?.description || `Read more about ${title}`,
    },
  });

  if (process.env.WORDPRESS_PLUGIN_SEO !== true) {
    metadata.title = title;
    metadata.og.title = metadata.title;
    metadata.twitter.title = metadata.title;
  }

  const metadataOptions = {
    compactCategories: false,
  };

  const { posts: relatedPostsList, title: relatedPostsTitle } = related || {};

  const helmetSettings = helmetSettingsFromMetadata(metadata);

  const elements = helmetSettings.meta.map((meta, i) => (
    <meta key={i} property={meta.property} content={meta.content} />
  ));

  return (
    <Layout>
      <ArticleJsonLd post={post} siteTitle={siteMetadata.title} />
      <Head>{elements}</Head>
      <Header>
        {featuredImage && (
          <FeaturedImage
            {...featuredImage}
            src={featuredImage.sourceUrl}
            dangerouslySetInnerHTML={featuredImage.caption}
          />
        )}
        <h1
          className={styles.title}
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
      </Header>

      <Content>
        <Section>
          <Container>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          </Container>
        </Section>
      </Content>

      <Section className={styles.postFooter}>
        <Container>
          {Array.isArray(relatedPostsList) && relatedPostsList.length > 0 && (
            <div className={styles.relatedPosts}>
              {relatedPostsTitle.name ? (
                <span>
                  More from{" "}
                  <Link href={relatedPostsTitle.link}>
                    <a>{relatedPostsTitle.name}</a>
                  </Link>
                </span>
              ) : (
                <span>More Posts</span>
              )}
              <ul>
                {relatedPostsList.map((post) => (
                  <li key={post.title}>
                    <Link href={postPathBySlug(post.slug)}>
                      <a>{post.title}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  );
}

export async function getStaticProps({ params = {} } = {}) {
  const { post } = await getPostBySlug(params?.slug);

  if (!post) {
    return {
      props: {},
      notFound: true,
    };
  }

  const { categories, databaseId: postId } = post;

  const dom = parse(post.content);
  const ads = dom.querySelectorAll('[id^="quads-ad"]')
  ads.forEach(adElement => adElement.remove());
  post.content = dom.toString();
  const props = {
    post,
    socialImage: `${process.env.OG_IMAGE_DIRECTORY}/${params?.slug}.png`,
  };

  const { category: relatedCategory, posts: relatedPosts } =
    (await getRelatedPosts(categories, postId)) || {};
  const hasRelated =
    relatedCategory && Array.isArray(relatedPosts) && relatedPosts.length;

  if (hasRelated) {
    props.related = {
      posts: relatedPosts,
      title: {
        name: relatedCategory.name || null,
        link: categoryPathBySlug(relatedCategory.slug),
      },
    };
  }

  return {
    props,
  };
}

export async function getStaticPaths() {
  // Only render the most recent posts to avoid spending unecessary time
  // querying every single post from WordPress

  // Tip: this can be customized to use data or analytitcs to determine the
  // most popular posts and render those instead

  const { posts } = await getRecentPosts({
    count: process.env.POSTS_PRERENDER_COUNT, // Update this value in next.config.js!
    queryIncludes: "index",
  });

  const paths = posts
    .filter(({ slug }) => typeof slug === "string")
    .map(({ slug }) => ({
      params: {
        slug,
      },
    }));

  return {
    paths,
    fallback: "blocking",
  };
}