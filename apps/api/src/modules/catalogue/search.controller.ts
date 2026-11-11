import { Controller, Get, Query } from "@nestjs/common";
import { CatalogueService } from "./catalogue.service";

@Controller("search")
export class SearchController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Get("suggestions")
  async getSuggestions(
    @Query("q") query?: string,
    @Query("limit") limit?: string,
  ) {
    const q = (query ?? "").trim();
    const take = Math.min(Math.max(Number(limit) || 6, 1), 20);

    if (!q) {
      return {
        query: "",
        products: [],
        brands: [],
        categories: [],
      };
    }

    return this.catalogueService.searchSuggestions(q, take);
  }
}
