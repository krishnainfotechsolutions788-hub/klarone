"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CatalogueToolbarProps {
  total: number;
  viewColumns: 3 | 4;
  onToggleView: (cols: 3 | 4) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount?: number;
}

export function CatalogueToolbar({
  total,
  onToggleFilters,
  activeFilterCount = 0,
}: CatalogueToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal input value if external URL search param changes
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const executeSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchValue(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(newVal);
    }, 350);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeSearch(searchValue);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchValue("");
    executeSearch("");
  };

  return (
    <div className="flex items-center justify-between gap-2.5 sm:gap-4">
      {/* Left: Filter Toggle Button with optional active badge count indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleFilters}
          aria-label="Filter products"
          className="relative inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full border border-stone-300 bg-white sm:px-5.5 text-xs sm:text-sm font-semibold tracking-tight text-slate-900 shadow-2xs transition-all duration-200 hover:border-slate-950 hover:bg-stone-50 active:scale-95 shrink-0"
        >
          <svg
            className="h-4 w-4 shrink-0 text-slate-800"
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

          {/* Mobile active filter dot / badge */}
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 sm:static flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop Product Count */}
        <span className="hidden sm:inline text-sm font-medium text-stone-500 whitespace-nowrap">
          {total} {total === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Right: Search Box (Same horizontal row on mobile and desktop) */}
      <form
        onSubmit={handleFormSubmit}
        action=""
        role="search"
        className="relative flex-1 max-w-full sm:max-w-xs md:max-w-sm"
      >
        <div className="relative flex items-center">
          {/* Clickable / Tappable Search Submit Icon */}
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-1.5 sm:left-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-stone-400 hover:text-slate-900 transition-colors"
          >
            {isPending ? (
              <svg
                className="h-4 w-4 animate-spin text-emerald-700"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
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
            )}
          </button>

          {/* Input Element with Mobile Keyboard Optimization */}
          <input
            type="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            value={searchValue}
            onChange={handleInputChange}
            placeholder="Search laptops..."
            className="h-10 sm:h-11 w-full rounded-full border border-stone-300 bg-white pl-9 sm:pl-10.5 pr-8 sm:pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950/10 shadow-2xs"
          />

          {/* Clear "x" Button when text exists */}
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2 sm:right-3 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition text-sm sm:text-base font-bold leading-none"
            >
              ×
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
