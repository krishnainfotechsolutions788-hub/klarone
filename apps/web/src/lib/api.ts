import { cache } from "react";
import type {
  CatalogueBrand,
  CatalogueCategory,
  CatalogueCollection,
  CatalogueFacets,
  CatalogueProductDetail,
  CatalogueProductsResponse,
} from "../types/catalogue";
import type {
  RecommendationStartResponse,
} from "../types/recommendations";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  nextOptions?: NextFetchRequestConfig,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    next: nextOptions,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export const getBrands = cache(async function getBrands(): Promise<CatalogueBrand[]> {
  return apiFetch<CatalogueBrand[]>("/catalogue/brands", undefined, {
    tags: ["catalogue", "brands"],
    revalidate: 3600,
  });
});

export const getCategories = cache(async function getCategories(): Promise<CatalogueCategory[]> {
  return apiFetch<CatalogueCategory[]>("/catalogue/categories", undefined, {
    tags: ["catalogue", "categories"],
    revalidate: 3600,
  });
});

export const getCollections = cache(async function getCollections(): Promise<CatalogueCollection[]> {
  return apiFetch<CatalogueCollection[]>("/catalogue/collections", undefined, {
    tags: ["catalogue", "collections"],
    revalidate: 3600,
  });
});

export const getFacets = cache(async function getFacets(params?: {
  categorySlug?: string;
  collectionSlug?: string;
}): Promise<CatalogueFacets> {
  const searchParams = new URLSearchParams();
  if (params?.categorySlug) searchParams.set("categorySlug", params.categorySlug);
  if (params?.collectionSlug) searchParams.set("collectionSlug", params.collectionSlug);
  const query = searchParams.toString();
  return apiFetch<CatalogueFacets>(
    `/catalogue/facets${query ? `?${query}` : ""}`,
    undefined,
    {
      tags: ["catalogue", "facets"],
      revalidate: 300,
    },
  );
});

export async function getProducts(params?: {
  search?: string;
  brandSlug?: string;
  brandSlugs?: string[];
  categorySlug?: string;
  collectionSlug?: string;
  collectionSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  ramGb?: number[];
  storageGb?: number[];
  inStockOnly?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest";
  page?: number;
  pageSize?: number;
}): Promise<CatalogueProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.brandSlug) searchParams.set("brandSlug", params.brandSlug);
  if (params?.brandSlugs && params.brandSlugs.length > 0) {
    searchParams.set("brandSlugs", params.brandSlugs.join(","));
  }
  if (params?.categorySlug) searchParams.set("categorySlug", params.categorySlug);
  if (params?.collectionSlug) searchParams.set("collectionSlug", params.collectionSlug);
  if (params?.collectionSlugs && params.collectionSlugs.length > 0) {
    searchParams.set("collectionSlugs", params.collectionSlugs.join(","));
  }
  if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
  if (params?.ramGb && params.ramGb.length > 0) {
    searchParams.set("ramGb", params.ramGb.join(","));
  }
  if (params?.storageGb && params.storageGb.length > 0) {
    searchParams.set("storageGb", params.storageGb.join(","));
  }
  if (params?.inStockOnly) searchParams.set("inStockOnly", "true");
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const query = searchParams.toString();

  // If user is searching or applying granular filters, fetch dynamically.
  // Default listing pages are cached with tag 'products-list'.
  const isFiltered = Boolean(
    params?.search ||
      params?.minPrice !== undefined ||
      params?.maxPrice !== undefined ||
      params?.ramGb?.length ||
      params?.storageGb?.length ||
      params?.inStockOnly,
  );

  return apiFetch<CatalogueProductsResponse>(
    `/catalogue/products${query ? `?${query}` : ""}`,
    undefined,
    isFiltered
      ? { revalidate: 30 }
      : {
          tags: ["catalogue", "products-list"],
          revalidate: 300,
        },
  );
}

export const getProduct = cache(async function getProduct(
  slug: string,
): Promise<CatalogueProductDetail> {
  return apiFetch<CatalogueProductDetail>(
    `/catalogue/products/${encodeURIComponent(slug)}`,
    undefined,
    {
      tags: ["catalogue", `product-${slug}`],
      revalidate: 3600, // Instant cache-tag revalidation
    },
  );
});

export async function startRecommendation(params: {
  message: string;
  sessionToken?: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
}): Promise<RecommendationStartResponse> {
  return apiFetch<RecommendationStartResponse>(
    "/recommendations/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
    { revalidate: 0 },
  );
}

export interface SearchSuggestionItem {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  brandSlug: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  sellingPrice: number | null;
  compareAtPrice: number | null;
  ramGb: number | null;
  storageGb: number | null;
}

export interface SearchSuggestionsResponse {
  query: string;
  products: SearchSuggestionItem[];
  brands: Array<{ id: number; name: string; slug: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
}

export async function getSearchSuggestions(query: string, limit = 6): Promise<SearchSuggestionsResponse> {
  if (!query.trim()) {
    return { query: "", products: [], brands: [], categories: [] };
  }
  return apiFetch<SearchSuggestionsResponse>(
    `/search/suggestions?q=${encodeURIComponent(query.trim())}&limit=${limit}`,
    undefined,
    { revalidate: 30 },
  );
}
