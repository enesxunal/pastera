import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-info";
import { BLOG_POSTS } from "@/lib/blog-posts";

const CORE_UPDATED_AT = new Date("2026-10-04");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/menu/pasta`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/menu/vorspeisen`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/menu/getraenke`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/builder`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/builder/vegan`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/restaurant-ehrenfeld`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pasta-koeln`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pasta-ehrenfeld`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/pasta-venloer-strasse`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(
        Math.max(...BLOG_POSTS.map((post) => new Date(post.updatedAt).getTime())),
      ),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/impressum`,
      lastModified: new Date("2026-09-23"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/datenschutz`,
      lastModified: new Date("2026-09-23"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
