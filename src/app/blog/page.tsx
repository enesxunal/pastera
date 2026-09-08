import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Pasta, Restaurants & Food-Guides für Köln und Dortmund",
  description:
    "Pastera Magazin: aktuelle Restaurant- und Food-Guides für Köln, Ehrenfeld und Dortmund sowie Pasta-Wissen und Pastera News.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Pastera Magazin – Köln & Dortmund",
    description:
      "Restaurant-Guides, Neueröffnungen, Pasta-Wissen und Pastera News.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const featured = BLOG_POSTS.slice(0, 4);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#c49746]">
        Pastera Magazin
      </p>
      <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold text-white sm:text-5xl">
        Restaurants, Pasta & neue Food-Spots in Köln und Dortmund
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
        Lokale Guides, Neueröffnungen, Pasta-Wissen und Neuigkeiten von Pastera.
        Unsere Inhalte werden redaktionell gepflegt und bei Standort-News erst
        aktualisiert, wenn Informationen bestätigt sind.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {featured.map((post) => (
          <BlogCard key={post.slug} post={post} featured />
        ))}
      </div>
      <h2 className="mt-16 font-display text-2xl font-bold text-white">
        Alle Artikel
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
function BlogCard({
  post,
  featured = false,
}: {
  post: (typeof BLOG_POSTS)[number];
  featured?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border border-[#2e402a] bg-[#0f0f0f] ${featured ? "p-7" : "p-5"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
        {post.city}
      </p>
      <h2
        className={`mt-2 font-display font-bold text-white ${featured ? "text-2xl" : "text-lg"}`}
      >
        <Link href={`/blog/${post.slug}`} className="hover:text-[#c49746]">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/55">{post.description}</p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-flex text-sm font-semibold text-[#c49746]"
      >
        Artikel lesen →
      </Link>
    </article>
  );
}
