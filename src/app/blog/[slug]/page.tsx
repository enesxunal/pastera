import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/site-info";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Pastera", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Pastera",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/pastera-Logo.png` },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Magazin",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Link href="/blog" className="text-sm font-semibold text-[#c49746]">
        ← Pastera Magazin
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#c49746]">
        {post.city} · Aktualisiert 08.09.2026
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-white/65">{post.description}</p>
      <div className="mt-10 space-y-10">
        {post.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl font-bold text-white">
              {s.heading}
            </h2>
            <p className="mt-3 text-base leading-8 text-white/70">{s.body}</p>
          </section>
        ))}
      </div>
      <RelatedPosts currentSlug={post.slug} city={post.city} />
      <aside className="mt-12 rounded-2xl border border-[#c49746]/30 bg-[#15130d] p-6">
        <h2 className="font-display text-xl font-bold text-[#c49746]">
          Pastera entdecken
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Unser aktuelles Menü und alle bestätigten Standortinformationen
          findest du direkt auf pastera.de.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/menu" className="font-semibold text-[#c49746]">
            Speisekarte →
          </Link>
          <a
            href="https://www.instagram.com/pastera.official/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#c49746]"
          >
            Instagram →
          </a>
        </div>
      </aside>
    </article>
  );
}

function RelatedPosts({
  currentSlug,
  city,
}: {
  currentSlug: string;
  city: string;
}) {
  const related = BLOG_POSTS.filter(
    (item) => item.slug !== currentSlug && item.city === city,
  ).slice(0, 3);
  if (!related.length) return null;
  return (
    <section className="mt-14 border-t border-[#2e402a] pt-8">
      <h2 className="font-display text-2xl font-bold text-white">
        Weiterlesen
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {related.map((item) => (
          <Link
            key={item.slug}
            href={`/blog/${item.slug}`}
            className="rounded-xl border border-[#2e402a] bg-[#0f0f0f] p-4 text-sm font-semibold leading-5 text-white/80 transition hover:border-[#c49746]/50 hover:text-[#c49746]"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
