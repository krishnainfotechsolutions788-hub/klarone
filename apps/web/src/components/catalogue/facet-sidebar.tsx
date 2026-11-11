"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CatalogueFacets } from "../../types/catalogue";

interface FacetSidebarProps {
  facets: CatalogueFacets;
  highestPrice: number;
  onApply?: () => void;
  isMobileDrawer?: boolean;
}

export function FacetSidebar({ facets, highestPrice, onApply, isMobileDrawer }: FacetSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Accordion open/close state
  const [openSections, setOpenSections] = useState({
    availability: true,
    collection: true,
    price: true,
    ram: true,
    storage: true,
    brand: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Extract current query params (Supporting multi-select collections)
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
    ? searchParams.get("ramGb")!.split(",").map(Number).filter(Boolean)
    : [];

  const currentStorageGbs = searchParams.get("storageGb")
    ? searchParams.get("storageGb")!.split(",").map(Number).filter(Boolean)
    : [];

  const currentInStockOnly = searchParams.get("inStockOnly") === "true";
  const urlMinPrice = searchParams.get("minPrice") ?? "";
  const urlMaxPrice = searchParams.get("maxPrice") ?? "";

  const effectiveMaxPrice = highestPrice > 0 ? highestPrice : 350000;

  // Local state for smooth slider dragging and responsive typing
  const [minPriceInput, setMinPriceInput] = useState<number>(() => {
    const val = Number(urlMinPrice);
    return !Number.isNaN(val) && val > 0 ? Math.min(val, effectiveMaxPrice) : 0;
  });

  const [maxPriceInput, setMaxPriceInput] = useState<number>(() => {
    const val = Number(urlMaxPrice);
    return !Number.isNaN(val) && val > 0 ? Math.min(val, effectiveMaxPrice) : effectiveMaxPrice;
  });

  // Keep local state in sync when URL query params or highestPrice change
  useEffect(() => {
    const minVal = Number(urlMinPrice);
    setMinPriceInput(!Number.isNaN(minVal) && minVal > 0 ? Math.min(minVal, effectiveMaxPrice) : 0);

    const maxVal = Number(urlMaxPrice);
    setMaxPriceInput(!Number.isNaN(maxVal) && maxVal > 0 ? Math.min(maxVal, effectiveMaxPrice) : effectiveMaxPrice);
  }, [urlMinPrice, urlMaxPrice, effectiveMaxPrice]);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // Ref to track debounce timer for slider drags
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const commitPriceChange = (minVal: number, maxVal: number) => {
    const safeMin = Math.max(0, Math.min(minVal, maxVal));
    const safeMax = Math.min(effectiveMaxPrice, Math.max(safeMin, maxVal));

    updateParams({
      minPrice: safeMin > 0 ? String(safeMin) : undefined,
      maxPrice: safeMax < effectiveMaxPrice ? String(safeMax) : undefined,
    });
  };

  const debouncedCommitPriceChange = (minVal: number, maxVal: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      commitPriceChange(minVal, maxVal);
    }, 450);
  };

  const handleMinSliderChange = (newMin: number) => {
    const clamped = Math.min(Math.max(0, newMin), maxPriceInput);
    setMinPriceInput(clamped);
    debouncedCommitPriceChange(clamped, maxPriceInput);
  };

  const handleMaxSliderChange = (newMax: number) => {
    const clamped = Math.max(Math.min(effectiveMaxPrice, newMax), minPriceInput);
    setMaxPriceInput(clamped);
    debouncedCommitPriceChange(minPriceInput, clamped);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : Number(e.target.value);
    if (!Number.isNaN(val)) {
      setMinPriceInput(val);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? effectiveMaxPrice : Number(e.target.value);
    if (!Number.isNaN(val)) {
      setMaxPriceInput(val);
    }
  };

  const handleInputBlurOrEnter = () => {
    const safeMin = Math.max(0, Math.min(minPriceInput, maxPriceInput));
    const safeMax = Math.min(effectiveMaxPrice, Math.max(safeMin, maxPriceInput));
    setMinPriceInput(safeMin);
    setMaxPriceInput(safeMax);
    commitPriceChange(safeMin, safeMax);
  };

  const toggleCollection = (slug: string) => {
    const exists = currentCollectionSlugs.includes(slug);
    const updated = exists
      ? currentCollectionSlugs.filter((s) => s !== slug)
      : [...currentCollectionSlugs, slug];
    updateParams({
      collectionSlugs: updated.length > 0 ? updated.join(",") : undefined,
      collectionSlug: undefined, // Clear single collectionSlug in favor of multi
    });
  };

  const toggleBrand = (slug: string) => {
    const exists = currentBrandSlugs.includes(slug);
    const updated = exists
      ? currentBrandSlugs.filter((s) => s !== slug)
      : [...currentBrandSlugs, slug];
    updateParams({
      brandSlugs: updated.length > 0 ? updated.join(",") : undefined,
      brandSlug: undefined, // Clear single brandSlug in favor of multi
    });
  };

  const toggleRam = (ram: number) => {
    const exists = currentRamGbs.includes(ram);
    const updated = exists
      ? currentRamGbs.filter((r) => r !== ram)
      : [...currentRamGbs, ram];
    updateParams({
      ramGb: updated.length > 0 ? updated.join(",") : undefined,
    });
  };

  const toggleStorage = (storage: number) => {
    const exists = currentStorageGbs.includes(storage);
    const updated = exists
      ? currentStorageGbs.filter((s) => s !== storage)
      : [...currentStorageGbs, storage];
    updateParams({
      storageGb: updated.length > 0 ? updated.join(",") : undefined,
    });
  };

  const toggleAvailability = (inStock: boolean) => {
    if (inStock) {
      updateParams({ inStockOnly: currentInStockOnly ? undefined : "true" });
    } else {
      updateParams({ inStockOnly: undefined });
    }
  };

  return (
    <aside className="w-full space-y-6">
      {/* 1. AVAILABILITY ACCORDION */}
      <div className="border-b border-stone-200/80 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          style={{
            fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
            fontSize: "23px",
            lineHeight: "1.25",
          }}
          className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
        >
          <span>Availability</span>
          <span className="text-2xl font-light leading-none text-slate-900 font-sans">
            {openSections.availability ? "−" : "+"}
          </span>
        </button>

        {openSections.availability && (
          <div className="mt-4 space-y-3.5">
            <label className="group flex items-center justify-between text-[15px] text-stone-700 cursor-pointer hover:text-slate-950 transition-colors">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={currentInStockOnly}
                  onChange={() => toggleAvailability(true)}
                  className="h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 cursor-pointer"
                />
                <span className="font-normal text-slate-800">In stock</span>
              </span>
              <span className="text-[14px] text-stone-400 font-light">{facets.availability.inStockCount}</span>
            </label>

            <label className="group flex items-center justify-between text-[15px] text-stone-700 cursor-pointer hover:text-slate-950 transition-colors">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!currentInStockOnly}
                  onChange={() => toggleAvailability(false)}
                  className="h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 cursor-pointer"
                />
                <span className="font-normal text-slate-800">All items</span>
              </span>
              <span className="text-[14px] text-stone-400 font-light">
                {facets.availability.inStockCount + facets.availability.outOfStockCount}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 2. COLLECTION ACCORDION */}
      {facets.collections && facets.collections.length > 0 && (
        <div className="border-b border-stone-200/80 pb-6">
          <button
            type="button"
            onClick={() => toggleSection("collection")}
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: "23px",
              lineHeight: "1.25",
            }}
            className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
          >
            <span>Collection</span>
            <span className="text-2xl font-light leading-none text-slate-900 font-sans">
              {openSections.collection ? "−" : "+"}
            </span>
          </button>

          {openSections.collection && (
            <div className="mt-4 space-y-3.5">
              {facets.collections.map((col) => {
                const isChecked = currentCollectionSlugs.includes(col.slug);
                const isDisabled = col.count === 0 && !isChecked;
                return (
                  <label
                    key={col.slug}
                    className={`group flex items-center justify-between text-[15px] transition-colors ${
                      isDisabled
                        ? "text-stone-400 cursor-not-allowed opacity-60"
                        : "text-stone-700 cursor-pointer hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleCollection(col.slug)}
                        className={`h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      />
                      <span className={`font-normal ${isChecked ? "font-semibold text-slate-950" : ""}`}>
                        {col.title}
                      </span>
                    </span>
                    <span className="text-[14px] text-stone-400 font-light">{col.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PRICE ACCORDION & SLIDER */}
      <div className="border-b border-stone-200/80 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          style={{
            fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
            fontSize: "23px",
            lineHeight: "1.25",
          }}
          className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
        >
          <span>Price</span>
          <span className="text-2xl font-light leading-none text-slate-900 font-sans">
            {openSections.price ? "−" : "+"}
          </span>
        </button>

        {openSections.price && (
          <div className="mt-4 space-y-4">
            <p className="text-[14px] text-stone-500 font-normal">
              The highest price is ₹{effectiveMaxPrice.toLocaleString("en-IN")}
            </p>

            {/* Interactive Dual-Thumb Range Slider */}
            <div className="relative flex items-center h-6 select-none">
              {/* Background Track */}
              <div className="absolute h-1.5 w-full rounded-full bg-stone-200">
                {/* Active Highlight Range Track */}
                <div
                  className="absolute h-1.5 rounded-full bg-slate-900 transition-all duration-75"
                  style={{
                    left: `${(minPriceInput / effectiveMaxPrice) * 100}%`,
                    right: `${100 - (maxPriceInput / effectiveMaxPrice) * 100}%`,
                  }}
                />
              </div>

              {/* Min Range Input */}
              <input
                type="range"
                min={0}
                max={effectiveMaxPrice}
                step={100}
                value={minPriceInput}
                onChange={(e) => handleMinSliderChange(Number(e.target.value))}
                className="dual-range-input z-20"
                aria-label="Minimum price"
              />

              {/* Max Range Input */}
              <input
                type="range"
                min={0}
                max={effectiveMaxPrice}
                step={100}
                value={maxPriceInput}
                onChange={(e) => handleMaxSliderChange(Number(e.target.value))}
                className="dual-range-input z-20"
                aria-label="Maximum price"
              />
            </div>

            {/* Min / Max Numeric Price Inputs */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex flex-1 items-center rounded-2xl bg-[#f0f2ee] px-4 py-3 focus-within:ring-2 focus-within:ring-slate-900/10 transition-shadow">
                <span className="text-[14px] text-stone-500 mr-2 font-normal select-none">₹</span>
                <input
                  type="number"
                  min={0}
                  max={effectiveMaxPrice}
                  value={minPriceInput === 0 ? "" : minPriceInput}
                  onChange={handleMinInputChange}
                  onBlur={handleInputBlurOrEnter}
                  onKeyDown={(e) => e.key === "Enter" && handleInputBlurOrEnter()}
                  className="w-full bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-stone-400"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-1 items-center rounded-2xl bg-[#f0f2ee] px-4 py-3 focus-within:ring-2 focus-within:ring-slate-900/10 transition-shadow">
                <span className="text-[14px] text-stone-500 mr-2 font-normal select-none">₹</span>
                <input
                  type="number"
                  min={0}
                  max={effectiveMaxPrice}
                  value={maxPriceInput === effectiveMaxPrice ? "" : maxPriceInput}
                  onChange={handleMaxInputChange}
                  onBlur={handleInputBlurOrEnter}
                  onKeyDown={(e) => e.key === "Enter" && handleInputBlurOrEnter()}
                  className="w-full bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-stone-400"
                  placeholder={String(effectiveMaxPrice)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. HARDWARE SPEC: RAM */}
      {facets.ramOptions.length > 0 && (
        <div className="border-b border-stone-200/80 pb-6">
          <button
            type="button"
            onClick={() => toggleSection("ram")}
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: "23px",
              lineHeight: "1.25",
            }}
            className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
          >
            <span>Size (RAM)</span>
            <span className="text-2xl font-light leading-none text-slate-900 font-sans">
              {openSections.ram ? "−" : "+"}
            </span>
          </button>

          {openSections.ram && (
            <div className="mt-4 space-y-3.5">
              {facets.ramOptions.map((opt) => {
                const isChecked = currentRamGbs.includes(opt.ramGb);
                const isDisabled = opt.count === 0 && !isChecked;
                return (
                  <label
                    key={opt.ramGb}
                    className={`group flex items-center justify-between text-[15px] transition-colors ${
                      isDisabled
                        ? "text-stone-400 cursor-not-allowed opacity-60"
                        : "text-stone-700 cursor-pointer hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleRam(opt.ramGb)}
                        className={`h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      />
                      <span className={`font-normal ${isChecked ? "font-semibold text-slate-950" : ""}`}>
                        {opt.ramGb}GB RAM
                      </span>
                    </span>
                    <span className="text-[14px] text-stone-400 font-light">{opt.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. HARDWARE SPEC: STORAGE */}
      {facets.storageOptions.length > 0 && (
        <div className="border-b border-stone-200/80 pb-6">
          <button
            type="button"
            onClick={() => toggleSection("storage")}
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: "23px",
              lineHeight: "1.25",
            }}
            className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
          >
            <span>Storage</span>
            <span className="text-2xl font-light leading-none text-slate-900 font-sans">
              {openSections.storage ? "−" : "+"}
            </span>
          </button>

          {openSections.storage && (
            <div className="mt-4 space-y-3.5">
              {facets.storageOptions.map((opt) => {
                const isChecked = currentStorageGbs.includes(opt.storageGb);
                const isDisabled = opt.count === 0 && !isChecked;
                const formattedLabel =
                  opt.storageGb >= 1024
                    ? `${opt.storageGb / 1024}TB SSD`
                    : `${opt.storageGb}GB SSD`;
                return (
                  <label
                    key={opt.storageGb}
                    className={`group flex items-center justify-between text-[15px] transition-colors ${
                      isDisabled
                        ? "text-stone-400 cursor-not-allowed opacity-60"
                        : "text-stone-700 cursor-pointer hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleStorage(opt.storageGb)}
                        className={`h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      />
                      <span className={`font-normal ${isChecked ? "font-semibold text-slate-950" : ""}`}>
                        {formattedLabel}
                      </span>
                    </span>
                    <span className="text-[14px] text-stone-400 font-light">{opt.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. BRAND ACCORDION */}
      {facets.brands.length > 0 && (
        <div className="border-b border-stone-200/80 pb-6">
          <button
            type="button"
            onClick={() => toggleSection("brand")}
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: "23px",
              lineHeight: "1.25",
            }}
            className="flex w-full items-center justify-between text-left font-normal tracking-tight text-slate-950"
          >
            <span>Brand</span>
            <span className="text-2xl font-light leading-none text-slate-900 font-sans">
              {openSections.brand ? "−" : "+"}
            </span>
          </button>

          {openSections.brand && (
            <div className="mt-4 space-y-3.5">
              {facets.brands.map((b) => {
                const isChecked = currentBrandSlugs.includes(b.slug);
                const isDisabled = b.count === 0 && !isChecked;
                return (
                  <label
                    key={b.slug}
                    className={`group flex items-center justify-between text-[15px] transition-colors ${
                      isDisabled
                        ? "text-stone-400 cursor-not-allowed opacity-60"
                        : "text-stone-700 cursor-pointer hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleBrand(b.slug)}
                        className={`h-5 w-5 rounded-[4px] border-stone-400 text-slate-950 focus:ring-0 accent-slate-950 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      />
                      <span className={`font-normal ${isChecked ? "font-semibold text-slate-950" : ""}`}>
                        {b.name}
                      </span>
                    </span>
                    <span className="text-[14px] text-stone-400 font-light">{b.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
