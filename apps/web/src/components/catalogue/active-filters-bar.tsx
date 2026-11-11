"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CatalogueFacets } from "../../types/catalogue";

interface ActiveFiltersBarProps {
  facets: CatalogueFacets;
}

interface FilterBadge {
  id: string;
  label: string;
  category: string;
  onRemove: () => void;
}

export function ActiveFiltersBar({ facets }: ActiveFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search")?.trim() ?? "";
  const currentCollectionSlug = searchParams.get("collectionSlug") ?? "";
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
      category: "Search",
      label: `"${currentSearch}"`,
      onRemove: () => removeParam({ search: undefined }),
    });
  }

  // 2. Collection Badge
  if (currentCollectionSlug) {
    const matchedCol = facets.collections?.find((c) => c.slug === currentCollectionSlug);
    badges.push({
      id: `collection-${currentCollectionSlug}`,
      category: "Collection",
      label: matchedCol ? matchedCol.title : currentCollectionSlug,
      onRemove: () => removeParam({ collectionSlug: undefined }),
    });
  }

  // 3. Brands Badges
  currentBrandSlugs.forEach((slug) => {
    const matchedBrand = facets.brands.find((b) => b.slug === slug);
    badges.push({
      id: `brand-${slug}`,
      category: "Brand",
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
      category: "RAM",
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
      category: "Storage",
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
      category: "Status",
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
      category: "Price",
      label: `${minFormatted} – ${maxFormatted}`,
      onRemove: () => removeParam({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 pb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">
        Active:
      </span>

      {badges.map((badge) => (
        <span
          key={badge.id}
          className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-stone-100/80 px-2.5 py-1 text-xs font-medium text-stone-800 transition-all hover:border-stone-400 hover:bg-stone-200/80"
        >
          <span className="text-stone-500 font-normal">{badge.category}:</span>
          <span className="font-semibold text-slate-900">{badge.label}</span>
          <button
            type="button"
            onClick={badge.onRemove}
            aria-label={`Remove filter ${badge.label}`}
            className="ml-0.5 -mr-1 flex h-4 w-4 items-center justify-center rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-300 transition-colors text-xs font-bold"
          >
            ×
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clearAllFilters}
        className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
