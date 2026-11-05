import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/newsletter-and-footer";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Global Storefront Floating Header */}
      <StorefrontHeader />

      {/* 2. Main Product Content (Offset top matching actual page) */}
      <main className="pt-[76px] sm:pt-20 md:pt-24">
        <div className="relative w-full bg-white text-neutral-900 pb-28">
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              
              {/* LEFT COLUMN: Gallery Skeleton */}
              <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:sticky lg:top-28 lg:self-start">
                {/* Desktop Vertical Thumbnail Strip */}
                <div className="hidden md:flex flex-col gap-3 shrink-0 w-20">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-20 aspect-square rounded-xl bg-neutral-100 border border-neutral-200/80 animate-pulse shrink-0"
                    />
                  ))}
                </div>

                {/* Main Large Gallery Image Card */}
                <div className="flex-1 rounded-2xl md:rounded-3xl bg-[#f8f9fa] border border-neutral-200/80 overflow-hidden p-6 sm:p-12 flex items-center justify-center min-h-[380px] sm:min-h-[480px] animate-pulse">
                  <div className="w-4/5 aspect-[16/10] rounded-xl bg-neutral-200/60" />
                </div>
              </div>

              {/* RIGHT COLUMN: Breadcrumbs & Buy Box */}
              <div className="lg:col-span-5 flex flex-col space-y-5 lg:sticky lg:top-28 lg:self-start">
                
                {/* 1. Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-10 rounded bg-neutral-200 animate-pulse" />
                  <span className="text-neutral-300">/</span>
                  <div className="h-3 w-20 rounded bg-neutral-200 animate-pulse" />
                  <span className="text-neutral-300">/</span>
                  <div className="h-3 w-36 rounded bg-neutral-200 animate-pulse" />
                </div>

                {/* 2. Title & Price Skeleton */}
                <div className="space-y-3 pt-1">
                  <div className="h-9 sm:h-11 w-4/5 rounded-lg bg-neutral-200 animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-neutral-100 animate-pulse" />
                  <div className="flex items-baseline gap-3 pt-2">
                    <div className="h-8 w-32 rounded-lg bg-neutral-200 animate-pulse" />
                    <div className="h-5 w-20 rounded bg-neutral-100 animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-neutral-100 animate-pulse pt-1" />
                </div>

                {/* 3. Option Selectors (Colors & Specs) */}
                <div className="space-y-4 pt-1">
                  {/* Color Swatches Skeleton */}
                  <div className="space-y-2">
                    <div className="h-3.5 w-16 rounded bg-neutral-200 animate-pulse" />
                    <div className="flex items-center gap-2.5 pt-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-9 rounded-full bg-neutral-200/80 ring-1 ring-neutral-200 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  {/* RAM/Storage Pills Skeleton */}
                  <div className="space-y-2">
                    <div className="h-3.5 w-24 rounded bg-neutral-200 animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-24 rounded-full bg-neutral-200/80 animate-pulse" />
                      <div className="h-9 w-24 rounded-full bg-neutral-100 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* 4. In-Stock Indicator */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-4 w-4 rounded-full bg-emerald-200 animate-pulse" />
                  <div className="h-3.5 w-48 rounded bg-emerald-100 animate-pulse" />
                </div>

                {/* 5. Stepper + Add To Cart Button */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-12 w-28 rounded-full border border-neutral-200 bg-white animate-pulse" />
                  <div className="flex-1 h-12 rounded-full bg-neutral-200/80 animate-pulse" />
                </div>

                {/* Buy It Now Accent Button */}
                <div className="w-full h-12 rounded-full bg-[#dcf19a]/70 animate-pulse" />

                {/* Value Props Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-neutral-200/80 pt-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 rounded bg-neutral-200 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-neutral-100 animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Accordions Skeleton */}
                <div className="border-t border-neutral-200/80 pt-3 divide-y divide-neutral-200/80">
                  <div className="py-4 flex justify-between items-center">
                    <div className="h-6 w-32 rounded bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse" />
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <div className="h-6 w-36 rounded bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse" />
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <div className="h-6 w-44 rounded bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Storefront Footer & Newsletter */}
      <StorefrontFooter />
    </div>
  );
}
