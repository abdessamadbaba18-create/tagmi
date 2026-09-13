"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, Tag, ArrowRight, User, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string;
  viewCount: number;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  author: { firstName: string; lastName: string; avatar: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/blog/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/blog?${params}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const catClass = (active: boolean) =>
    active
      ? "flex w-full items-center justify-between rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-left text-sm font-medium text-gold"
      : "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gold/5 hover:text-gold";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHeader
        badge="Le journal TAGMI"
        title="Blog immobilier marocain"
        subtitle="Conseils, guides et actualités du marché immobilier au Maroc."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              </div>
            ) : posts.length === 0 ? (
              <p className="py-20 text-center text-gray-500">Aucun article trouvé</p>
            ) : (
              <>
                {/* Featured post */}
                {posts[0] && (
                  <Link
                    href={`/blog/${posts[0].slug}`}
                    className="group mb-8 block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.3)]"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-64 overflow-hidden md:h-auto md:w-1/2">
                        {posts[0].coverImage ? (
                          <img
                            src={posts[0].coverImage}
                            alt={posts[0].title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink to-gold/40">
                            <PenLine className="h-12 w-12 text-gold-light/60" />
                          </div>
                        )}
                        {posts[0].category && (
                          <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-gold to-gold-light px-3 py-1 text-xs font-semibold text-ink shadow-md">
                            {posts[0].category.name}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col justify-center p-6 md:w-1/2">
                        <h2 className="mb-3 font-display text-2xl font-bold text-gray-900 transition-colors group-hover:text-gold">
                          {posts[0].title}
                        </h2>
                        {posts[0].excerpt && (
                          <p className="mb-5 line-clamp-3 text-gray-600">{posts[0].excerpt}</p>
                        )}
                        <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          {posts[0].author && (
                            <span className="flex items-center gap-1.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10">
                                <User className="h-3.5 w-3.5 text-gold" />
                              </span>
                              {posts[0].author.firstName} {posts[0].author.lastName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gold" />
                            {new Date(posts[0].publishedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-gold/30 px-4 py-2 text-sm font-semibold text-gold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-gold group-hover:to-gold-light group-hover:text-ink">
                          Lire l&apos;article
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {posts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink to-gold/40">
                            <PenLine className="h-10 w-10 text-gold-light/60" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-gold to-gold-light px-2.5 py-1 text-xs font-semibold text-ink shadow-md">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="mb-2 line-clamp-2 font-display font-bold text-gray-900 transition-colors group-hover:text-gold">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {post.author && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gold" />
                              {post.author.firstName} {post.author.lastName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gold" />
                            {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="ml-auto flex items-center gap-1">
                            <Eye className="h-3 w-3 text-gold" /> {post.viewCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      <span className="mx-1 font-display font-bold text-gold">{page}</span>
                      sur {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <h3 className="mb-4 flex items-center gap-2 font-display font-bold text-gray-900">
                <Tag className="h-4 w-4 text-gold" />
                Catégories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                  className={catClass(!selectedCategory)}
                >
                  <span>✨ Tous</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setPage(1);
                    }}
                    className={catClass(selectedCategory === cat.slug)}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-xs ${selectedCategory === cat.slug ? "text-gold" : "text-gray-400"}`}>
                      {cat.postCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}