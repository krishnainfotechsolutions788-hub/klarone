import XLSX from "xlsx";

export interface InventoryLaptop {
  brandSlug: string;
  categorySlug: string;
  parentName: string;
  slug: string;
  modelNumber: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  collectionSlugs: string[];
  variants: Array<{
    sku: string;
    variantName: string;
    color: string;
    ramGb: number;
    storageGb: number;
    sellingPrice: string;
    compareAtPrice: string;
    cpuBrand: string;
    cpuModel: string;
    cpuGeneration: string;
    gpuBrand: string;
    gpuModel: string;
    displaySizeInches: string;
    displayResolution: string;
    displayPanelType: string;
    isTouch: boolean;
    operatingSystem: string;
    condition: string;
  }>;
}

// Map authentic high-res Cloudinary images for laptop models
const BRAND_HERO_IMAGES: Record<string, string> = {
  dell_latitude: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/204/hero.webp",
  dell_precision: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/215/hero.webp",
  dell_inspiron: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/219/hero.webp",
  dell_vostro: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/221/hero.webp",
  hp_elitebook: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/228/hero.webp",
  hp_probook: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/229/hero.webp",
  hp_zbook: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/230/hero.webp",
  hp_15: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/231/hero.webp",
  lenovo_thinkpad: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/235/hero.webp",
  lenovo_ideapad: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/237/hero.webp",
  microsoft_surface: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/240/hero.webp",
  apple_macbook_air: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/191/hero.webp",
  apple_macbook_pro: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/192/hero.webp",
  acer_aspire: "https://res.cloudinary.com/dfjzdnuec/image/upload/v1792761188/klarone/products/202/hero.webp",
};

export function parseInventoryFile(filePath: string): InventoryLaptop[] {
  const wb = XLSX.readFile(filePath);
  const rawRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  // Group variants by standardized parent product
  const productMap = new Map<string, InventoryLaptop>();

  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const rawModel: string = String(row.MODEL || "").trim();
    const genStr: string = String(row.GENERATION || "").trim().toUpperCase();
    const ram: number = Number(row.RAM) || 8;
    const rawSsd: string = String(row.SSD || "").trim();
    const isTouch: boolean = String(row.TOUCH || "").toUpperCase().includes("YES");
    const mop: number = Number(row.MOP) || 19990;

    let storageGb = 256;
    if (rawSsd.includes("512")) storageGb = 512;
    else if (rawSsd.includes("128")) storageGb = 128;
    else if (rawSsd.includes("1TB") || rawSsd.includes("1000")) storageGb = 1000;
    else if (Number(rawSsd) > 0) storageGb = Number(rawSsd);

    // Identify Brand, Series, and Canonical Name
    let brandSlug = "dell";
    let categorySlug = "ultrabooks";
    let parentName = "";
    let heroImage = BRAND_HERO_IMAGES.dell_latitude;
    let cpuBrand = "Intel";
    let cpuModel = "Intel Core i5";
    let cpuGeneration = genStr;
    let displaySize = "14.0";
    let displayResolution = "1920 x 1080 (FHD)";
    let os = "Windows 10 Pro";

    // Clean up Generation string
    let genNum = 8;
    const genMatch = genStr.match(/(\d+)TH/i) || genStr.match(/(\d+)ND/i) || genStr.match(/(\d+)RD/i);
    if (genMatch) genNum = parseInt(genMatch[1], 10);
    else if (genStr.includes("6TH") || genStr.includes("IS 6TH")) genNum = 6;
    else if (genStr.includes("7TH")) genNum = 7;
    else if (genStr.includes("8TH")) genNum = 8;
    else if (genStr.includes("10TH")) genNum = 10;
    else if (genStr.includes("11TH")) genNum = 11;

    let tier = "i5";
    if (genStr.includes("I7")) tier = "i7";
    else if (genStr.includes("I3")) tier = "i3";
    else if (genStr.includes("I9")) tier = "i9";
    else if (genStr.includes("AMD") || genStr.includes("A6")) {
      tier = "AMD";
      cpuBrand = "AMD";
      cpuModel = "AMD A6-9220 Dual-Core";
    }

    if (cpuBrand === "Intel") {
      cpuModel = `Intel Core ${tier} ${genNum}th Gen`;
    }

    // Standardize Parent Product & Specs based on Model string
    const mUpper = rawModel.toUpperCase();

    if (mUpper.startsWith("DELL")) {
      brandSlug = "dell";
      if (mUpper.includes("PRECISION")) {
        categorySlug = "workstations";
        parentName = "Dell Precision 3541 Workstation";
        heroImage = BRAND_HERO_IMAGES.dell_precision;
        displaySize = "15.6";
        cpuBrand = "Intel";
        cpuModel = "Intel Core i7-9750H (6-Core)";
      } else if (mUpper.includes("VOSTRO")) {
        parentName = "Dell Vostro 5510";
        heroImage = BRAND_HERO_IMAGES.dell_vostro;
        displaySize = "15.6";
      } else if (mUpper.includes("INSPIRON")) {
        if (mUpper.includes("3565")) parentName = "Dell Inspiron 15 3565";
        else parentName = "Dell Inspiron 15 3567";
        heroImage = BRAND_HERO_IMAGES.dell_inspiron;
        displaySize = "15.6";
      } else {
        // Dell Latitude
        heroImage = BRAND_HERO_IMAGES.dell_latitude;
        let numMatch = mUpper.match(/(\d{4})/);
        let modelDigits = numMatch ? numMatch[1] : "5400";
        if (mUpper.startsWith("DELL E5420") || mUpper.startsWith("DELL E5490") || mUpper.startsWith("DELL LATITUDE E5470")) {
          parentName = `Dell Latitude E${modelDigits}`;
        } else {
          parentName = `Dell Latitude ${modelDigits}`;
        }

        if (mUpper.includes("15\"") || modelDigits.startsWith("55") || modelDigits.startsWith("35")) {
          displaySize = "15.6";
        } else if (modelDigits.startsWith("73") || modelDigits.startsWith("53") || modelDigits.startsWith("33")) {
          displaySize = "13.3";
        } else {
          displaySize = "14.0";
        }
      }
    } else if (mUpper.startsWith("HP")) {
      brandSlug = "hp";
      if (mUpper.includes("ZBOOK")) {
        categorySlug = "workstations";
        parentName = "HP ZBook Firefly 14 G7";
        heroImage = BRAND_HERO_IMAGES.hp_zbook;
        displaySize = "14.0";
      } else if (mUpper.includes("ELITEBOOK") || mUpper.includes("820") || mUpper.includes("830") || mUpper.includes("840") || mUpper.includes("850")) {
        let num = mUpper.match(/8\d0/)?.[0] || "840";
        let gMatch = mUpper.match(/G\d/)?.[0] || "G5";
        parentName = `HP EliteBook ${num} ${gMatch}`;
        heroImage = BRAND_HERO_IMAGES.hp_elitebook;
        displaySize = num === "850" ? "15.6" : num === "820" ? "12.5" : num === "830" ? "13.3" : "14.0";
      } else if (mUpper.includes("PROBOOK") || mUpper.includes("440") || mUpper.includes("450") || mUpper.includes("640") || mUpper.includes("650") || mUpper.includes("240")) {
        let num = mUpper.match(/(440|450|640|650|240)/)?.[0] || "440";
        let gMatch = mUpper.match(/G\d/)?.[0] || "G7";
        parentName = `HP ProBook ${num} ${gMatch}`;
        heroImage = BRAND_HERO_IMAGES.hp_probook;
        displaySize = (num === "450" || num === "650") ? "15.6" : "14.0";
      } else {
        parentName = "HP 15 Laptop";
        heroImage = BRAND_HERO_IMAGES.hp_15;
        displaySize = "15.6";
      }
    } else if (mUpper.startsWith("LENOVO")) {
      brandSlug = "lenovo";
      heroImage = BRAND_HERO_IMAGES.lenovo_thinkpad;
      if (mUpper.includes("IDEAPAD")) {
        parentName = "Lenovo IdeaPad Slim";
        heroImage = BRAND_HERO_IMAGES.lenovo_ideapad;
        displaySize = "15.6";
      } else if (mUpper.includes("E560") || mUpper.includes("T570")) {
        let modelCode = mUpper.match(/[ET]5\d0/)?.[0] || "E560";
        parentName = `Lenovo ThinkPad ${modelCode}`;
        displaySize = "15.6";
      } else {
        let modelCode = mUpper.match(/[ET]\d{3}[S]?/)?.[0] || "T470";
        parentName = `Lenovo ThinkPad ${modelCode}`;
        displaySize = "14.0";
      }
    } else if (mUpper.includes("SURFACE")) {
      brandSlug = "microsoft";
      categorySlug = "ultrabooks";
      heroImage = BRAND_HERO_IMAGES.microsoft_surface;
      if (mUpper.includes("4")) {
        parentName = "Microsoft Surface Laptop 4";
      } else {
        parentName = "Microsoft Surface Laptop 3";
      }
      displaySize = "13.5";
      displayResolution = "2256 x 1504 (PixelSense Touch)";
    } else if (mUpper.includes("MACBOOK") || mUpper.includes("MACKBOOK")) {
      brandSlug = "apple";
      categorySlug = "ultrabooks";
      os = "macOS Sonoma";
      if (mUpper.includes("AIR")) {
        parentName = "Apple MacBook Air 13″";
        heroImage = BRAND_HERO_IMAGES.apple_macbook_air;
        displaySize = "13.3";
        displayResolution = "1440 x 900";
        cpuBrand = "Intel";
        cpuModel = "Intel Core i5 Dual-Core 1.8GHz";
      } else {
        parentName = "Apple MacBook Pro 16″";
        heroImage = BRAND_HERO_IMAGES.apple_macbook_pro;
        displaySize = "16.0";
        displayResolution = "3072 x 1920 (Retina Display)";
        cpuBrand = "Intel";
        cpuModel = "Intel Core i9 8-Core 2.3GHz";
        categorySlug = "workstations";
      }
    } else if (mUpper.startsWith("ACER")) {
      brandSlug = "acer";
      parentName = "Acer Aspire 15";
      heroImage = BRAND_HERO_IMAGES.acer_aspire;
      displaySize = "15.6";
    }

    const slug = parentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Selling price is MOP, CompareAt is original retail (~40-60% higher)
    const sellingPrice = mop.toFixed(2);
    const compareAtPrice = Math.round(mop * 1.55).toFixed(2);

    const sku = `${slug.toUpperCase().slice(0, 10)}-${ram}G-${storageGb}S-${idx + 1}`;
    const variantName = `${cpuModel} • ${ram}GB RAM • ${storageGb >= 1000 ? "1TB" : storageGb + "GB"} SSD${isTouch ? " • Touchscreen" : ""}`;

    const collectionSlugs: string[] = ["bestsellers"];
    if (mop <= 22000) collectionSlugs.push("student");
    if (parseFloat(displaySize) <= 14.0) collectionSlugs.push("thin-light");
    if (categorySlug === "workstations" || mop >= 35000) collectionSlugs.push("flagship");

    const variant = {
      sku,
      variantName,
      color: mUpper.includes("BLACK") ? "Matte Black" : mUpper.includes("METAL") ? "Platinum Silver" : "Dark Ash Silver",
      ramGb: ram,
      storageGb,
      sellingPrice,
      compareAtPrice,
      cpuBrand,
      cpuModel,
      cpuGeneration: genStr || "Standard",
      gpuBrand: mUpper.includes("GRAPHICS") ? "NVIDIA" : "Intel",
      gpuModel: mUpper.includes("GRAPHICS") ? "Dedicated NVIDIA Graphics" : "Intel Integrated UHD/Iris Xe Graphics",
      displaySizeInches: displaySize,
      displayResolution,
      displayPanelType: isTouch ? "Touchscreen IPS Anti-Glare" : "FHD IPS Anti-Glare",
      isTouch,
      operatingSystem: os,
      condition: "Refurbished - Grade A",
    };

    if (!productMap.has(slug)) {
      productMap.set(slug, {
        brandSlug,
        categorySlug,
        parentName,
        slug,
        modelNumber: parentName,
        shortDescription: `Certified Grade-A Refurbished ${parentName} with ${cpuModel}, ${ram}GB RAM, fast SSD, and pre-installed ${os}. Inspected with Klarone 40-point quality assurance.`,
        description: `Experience enterprise-grade durability and seamless multitasking with the ${parentName}. Fully refurbished and tested to pristine operational standards by Klarone engineers in Kolkata. Features crisp ${displaySize}″ display, robust thermal architecture, and comprehensive local warranty support.`,
        heroImage,
        collectionSlugs,
        variants: [variant],
      });
    } else {
      productMap.get(slug)!.variants.push(variant);
    }
  }

  return Array.from(productMap.values());
}
