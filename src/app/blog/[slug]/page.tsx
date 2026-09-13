"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Tag, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/${slug}`);
      const data = await res.json();
      if (data.success) setPost(data.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Article non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover with branded overlay */}
      {post.coverImage && (
        <div className="relative h-64 md:h-[28rem]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-black/40 to-transparent" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 pb-8">
              <Link
                href="/blog"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold-light"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au blog
              </Link>
              <h1 className="max-w-3xl font-display text-3xl font-bold text-white md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
                {post.author && (
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20">
                      <User className="h-4 w-4 text-gold-light" />
                    </span>
                    {post.author.firstName} {post.author.lastName}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gold-light" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-gold-light" />
                  {post.viewCount} vues
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <article className="mx-auto max-w-3xl">
          {/* Category badge + share */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {post.category ? (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-ink shadow-md shadow-gold/25 transition-transform hover:scale-105"
              >
                <Tag className="h-3.5 w-3.5" />
                {post.category.name}
              </Link>
            ) : (
              <span />
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-gray-200 text-gray-600 hover:border-gold/40 hover:text-gold"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>

          {!post.coverImage && (
            <>
              <h1 className="mb-4 font-display text-3xl font-bold text-gray-900 md:text-4xl">
                {post.title}
              </h1>
              <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {post.author && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gold" />
                    {post.author.firstName} {post.author.lastName}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gold" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gold" />
                  {post.viewCount} vues
                </span>
              </div>
            </>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-gray-900 prose-a:text-gold prose-a:no-underline prose-a:transition-colors prose-a:hover:text-gold-light prose-img:rounded-2xl prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:not-italic leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-10 border-t border-gray-100 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gold" />
                {post.tags.map((tag: any) => (
                  <Link
                    key={tag.slug}
                    href={`/blog?tag=${tag.slug}`}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back CTA */}
          <div className="mt-10 flex justify-center">
            <Link href="/blog">
              <Button className="rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-md shadow-gold/25 hover:shadow-lg hover:shadow-gold/35">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Découvrir plus d&apos;articles
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}