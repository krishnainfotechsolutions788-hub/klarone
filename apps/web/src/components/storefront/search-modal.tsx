"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { getSearchSuggestions, type SearchSuggestionsResponse } from "../../lib/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle global escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query handler
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      getSearchSuggestions(trimmed, 6)
        .then((res) => {
          setResults(res);
        })
        .catch(() => {
          setResults({ query: trimmed, products: [], brands: [], categories: [] });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Full catalog search submission
  const handleFullSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;
    onClose();
    startTransition(() => {
      router.push(`/laptops?search=${encodeURIComponent(q)}`);
    });
  };

  const popularSearches = [
    { label: "MacBook Air", query: "MacBook Air" },
    { label: "ThinkPad", query: "ThinkPad" },
    { label: "Dell Latitude", query: "Dell Latitude" },
    { label: "16GB RAM", query: "16GB" },
    { label: "Core i5 8th Gen", query: "i5 8th" },
    { label: "Under ₹20,000", query: "Aspire" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-12 sm:pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md"
          />

          {/* Search Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden z-10 flex flex-col max-h-[82vh]"
          >
            {/* Input Header */}
            <div className="relative flex items-center px-5 sm:px-6 py-4.5 border-b border-neutral-100">
              <svg
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isLoading ? "text-emerald-700 animate-spin" : "text-neutral-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                {isLoading ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                )}
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFullSearch();
                  }
                }}
                placeholder="Search MacBook, ThinkPad, Dell, Core i5, 16GB RAM..."
                className="w-full bg-transparent pl-3.5 pr-10 text-neutral-900 placeholder:text-neutral-400 text-base sm:text-lg font-medium outline-hidden"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-14 text-xs font-semibold text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              ) : null}

              {/* ESC Key pill indicator */}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center px-2 py-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition"
              >
                ESC
              </button>
            </div>

            {/* Results / Suggestion Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Scenario 1: Initial Empty State (Popular Searches & Quick Categories) */}
              {!query.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Popular Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setQuery(item.query);
                          handleFullSearch(item.query);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-neutral-100/80 hover:bg-neutral-200 text-neutral-800 transition"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Explore By Brand
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
                      {["Apple", "Dell", "Lenovo", "HP"].map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/laptops?brandSlug=${brand.toLowerCase()}`);
                          }}
                          className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-neutral-200/90 hover:border-neutral-900 text-xs sm:text-sm font-medium text-neutral-800 transition active:scale-95"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 2: Active Results */}
              {query.trim() && results && (
                <div className="space-y-5">
                  {/* Matching Products */}
                  {results.products.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between pb-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          Matching Laptops ({results.products.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleFullSearch()}
                          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition"
                        >
                          View all in catalog →
                        </button>
                      </div>

                      <div className="divide-y divide-neutral-100">
                        {results.products.map((product) => (
                          <Link
                            key={product.id}
                            href={`/laptops/${product.slug}`}
                            onClick={onClose}
                            className="group flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-neutral-50 transition"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="relative w-14 h-14 rounded-xl bg-[#f8f9fa] border border-neutral-200/70 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="56px"
                                    className="object-contain p-1 group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded bg-neutral-200" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-emerald-950">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 pt-0.5">
                                  {product.brandName && (
                                    <span className="font-medium text-neutral-700">{product.brandName}</span>
                                  )}
                                  {product.ramGb && (
                                    <>
                                      <span>•</span>
                                      <span>{product.ramGb}GB RAM</span>
                                    </>
                                  )}
                                  {product.storageGb && (
                                    <>
                                      <span>•</span>
                                      <span>{product.storageGb >= 1000 ? `${product.storageGb / 1000}TB` : `${product.storageGb}GB`} SSD</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3">
                              {product.sellingPrice !== null && (
                                <p className="text-sm font-bold text-neutral-900">
                                  ₹{product.sellingPrice.toLocaleString("en-IN")}
                                </p>
                              )}
                              {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || 0) && (
                                <p className="text-[11px] text-neutral-400 line-through">
                                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* No direct laptop hits */
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm font-medium text-neutral-900">
                        No laptops found matching &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Try searching with broader terms like &ldquo;Dell&rdquo;, &ldquo;i5&rdquo;, &ldquo;16GB RAM&rdquo;, or talk to our AI Advisor.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleFullSearch()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                        >
                          Search full catalogue anyway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Matching Brands or Categories */}
                  {(results.brands.length > 0 || results.categories.length > 0) && (
                    <div className="pt-3 border-t border-neutral-100 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Filters & Collections
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {results.brands.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/laptops?brandSlug=${b.slug}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 hover:border-neutral-900 transition"
                          >
                            Brand: {b.name}
                          </button>
                        ))}
                        {results.categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/laptops?categorySlug=${c.slug}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 hover:border-neutral-900 transition"
                          >
                            Category: {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer bar */}
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded-sm bg-white border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-700 shadow-2xs">
                  ↵ Enter
                </kbd>
                <span>to view all in catalogue</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/select");
                }}
                className="text-emerald-800 hover:text-emerald-950 font-semibold transition"
              >
                Need personalized help? Ask AI Advisor →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
