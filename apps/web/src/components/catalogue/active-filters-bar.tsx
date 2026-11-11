"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CatalogueFacets } from "../../types/catalogue";

interface ActiveFiltersBarProps {
  facets: CatalogueFacets;
  total?: number;
}

interface FilterBadge {
  id: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFiltersBar({ facets, total }: ActiveFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search")?.trim() ?? "";
  const currentCollectionSlugs = searchParams.get("collectionSlugs")
    ? searchParams.get("collectionSlugs")!.split(",").filter(Boolean)
    : searchParams.get("collectionSlug")
    ? [searchParams.get("collectionSlug")!]
    : [];
  const currentBrandSlugs = searchParams.get("brandSlugs")
    ? searchParams.get("brandSlugs")!.split(",").filter(Boolean)
    : searchParams.get("brandSlug")
    ? [searchParams.get("brandSlug")!]
    : [];
  const currentRamGbs = searchParams.get("ramGb")
    ? searchParams.get("ramGb")!.split(",").filter(Boolean)
    : [];
  const currentStorageGbs = searchParams.get("storageGb")
    ? searchParams.get("storageGb")!.split(",").filter(Boolean)
    : [];
  const currentInStockOnly = searchParams.get("inStockOnly") === "true";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const removeParam = (keysToUpdate: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(keysToUpdate)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const badges: FilterBadge[] = [];

  // 1. Search Query Badge
  if (currentSearch) {
    badges.push({
      id: "search",
      label: `"${currentSearch}"`,
      onRemove: () => removeParam({ search: undefined }),
    });
  }

  // 2. Collections Badges (Multi-select)
  currentCollectionSlugs.forEach((slug) => {
    const matchedCol = facets.collections?.find((c) => c.slug === slug);
    badges.push({
      id: `collection-${slug}`,
      label: matchedCol ? matchedCol.title : slug,
      onRemove: () => {
        const remaining = currentCollectionSlugs.filter((s) => s !== slug);
        removeParam({
          collectionSlugs: remaining.length > 0 ? remaining.join(",") : undefined,
          collectionSlug: undefined,
        });
      },
    });
  });

  // 3. Brands Badges
  currentBrandSlugs.forEach((slug) => {
    const matchedBrand = facets.brands.find((b) => b.slug === slug);
    badges.push({
      id: `brand-${slug}`,
      label: matchedBrand ? matchedBrand.name : slug,
      onRemove: () => {
        const remaining = currentBrandSlugs.filter((s) => s !== slug);
        removeParam({
          brandSlugs: remaining.length > 0 ? remaining.join(",") : undefined,
          brandSlug: undefined,
        });
      },
    });
  });

  // 4. RAM Badges
  currentRamGbs.forEach((ram) => {
    badges.push({
      id: `ram-${ram}`,
      label: `${ram}GB RAM`,
      onRemove: () => {
        const remaining = currentRamGbs.filter((r) => r !== ram);
        removeParam({
          ramGb: remaining.length > 0 ? remaining.join(",") : undefined,
        });
      },
    });
  });

  // 5. Storage Badges
  currentStorageGbs.forEach((storage) => {
    const label = Number(storage) >= 1024 ? `${Number(storage) / 1024}TB SSD` : `${storage}GB SSD`;
    badges.push({
      id: `storage-${storage}`,
      label,
      onRemove: () => {
        const remaining = currentStorageGbs.filter((s) => s !== storage);
        removeParam({
          storageGb: remaining.length > 0 ? remaining.join(",") : undefined,
        });
      },
    });
  });

  // 6. In-Stock Badge
  if (currentInStockOnly) {
    badges.push({
      id: "instock",
      label: "In Stock Only",
      onRemove: () => removeParam({ inStockOnly: undefined }),
    });
  }

  // 7. Price Range Badge
  if (currentMinPrice || currentMaxPrice) {
    const minFormatted = currentMinPrice ? `₹${Number(currentMinPrice).toLocaleString("en-IN")}` : "₹0";
    const maxFormatted = currentMaxPrice ? `₹${Number(currentMaxPrice).toLocaleString("en-IN")}` : "Max";
    badges.push({
      id: "price-range",
      label: `${minFormatted} – ${maxFormatted}`,
      onRemove: () => removeParam({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  // When no filters are applied, show subtle product count on mobile only
  if (badges.length === 0) {
    if (total !== undefined) {
      return (
        <div className="flex sm:hidden items-center justify-between pt-2 text-[11px] font-medium text-stone-400 tracking-tight">
          <span>{total} {total === 1 ? "product" : "products"} available</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 pt-2.5 sm:pt-3">
      {/* Horizontally scrollable pill container on mobile, flex-wrap on desktop */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
        {total !== undefined && (
          <span className="text-[11px] font-medium text-stone-400 shrink-0 hidden sm:inline mr-1">
            {total} {total === 1 ? "product" : "products"}:
          </span>
        )}

        {badges.map((badge) => (
          <span
            key={badge.id}
            className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-100/90 pl-2.5 pr-1.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-800 shrink-0 transition-colors hover:border-stone-300"
          >
            <span className="truncate max-w-[150px] sm:max-w-[200px] font-semibold text-slate-900">
              {badge.label}
            </span>
            <button
              type="button"
              onClick={badge.onRemove}
              aria-label={`Remove filter ${badge.label}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-colors text-[11px] font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Clear all action link */}
      <button
        type="button"
        onClick={clearAllFilters}
        className="shrink-0 text-[11px] sm:text-xs font-semibold text-stone-500 hover:text-slate-950 transition-colors underline underline-offset-2 py-0.5 px-1"
      >
        Clear all
      </button>
    </div>
  );
}
