"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CatalogueToolbarProps {
  total: number;
  viewColumns: 3 | 4;
  onToggleView: (cols: 3 | 4) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function CatalogueToolbar({
  total,
  viewColumns,
  onToggleView,
  showFilters,
  onToggleFilters,
}: CatalogueToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Keep input in sync with URL
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchValue.trim();
    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4 border-b border-stone-200/80 pb-4 sm:pb-6">
      {/* Top Bar on Mobile & Desktop: Unified Horizontal Control Row */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Filter Button (Icon-only circle on mobile, pill with 'Filter' label on desktop) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-label="Filter products"
            className="inline-flex h-11 w-11 sm:w-auto items-center justify-center gap-2 rounded-full border border-stone-300 bg-white sm:px-5.5 text-xs sm:text-sm font-semibold tracking-tight text-slate-900 shadow-2xs transition-all duration-200 hover:border-slate-950 hover:bg-stone-50 active:scale-95 shrink-0"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Desktop Product Count */}
          <span className="hidden sm:inline text-sm font-medium text-stone-500 whitespace-nowrap">
            {total} {total === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Right: Search Box (Same horizontal line on mobile and desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-full sm:max-w-xs md:max-w-sm"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search laptops..."
              className="h-11 w-full rounded-full border border-stone-300 bg-white pl-9 sm:pl-10 pr-8 sm:pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950/10 shadow-2xs"
            />

            {/* Search Icon inside Input */}
            <div className="pointer-events-none absolute left-3 sm:left-3.5 text-stone-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            {/* Clear "x" Button when text exists */}
            {searchValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-2.5 sm:right-3 flex h-5 w-5 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition text-sm font-bold leading-none"
              >
                ×
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Subtle Sub-row: Product Count */}
      <div className="flex sm:hidden items-center justify-between text-xs text-stone-500 px-1">
        <span>Showing {total} {total === 1 ? "product" : "products"}</span>
        {currentSearch && (
          <span className="text-emerald-700 font-medium truncate max-w-[180px]">
            Filtered by &ldquo;{currentSearch}&rdquo;
          </span>
        )}
      </div>
    </div>
  );
}
