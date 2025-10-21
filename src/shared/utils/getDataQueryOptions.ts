import { COLLECTION_SLUGS } from "@/services/api/api-url-builder";
import { payloadService } from "@/services/api/payload-service";

import { AUTHORS_PER_PAGE } from "../constants/authors.constants";
import { PRODUCTS_PER_PAGE } from "../constants/products.constants";
import type { QueryParams } from "../types/query-params.type";

export const getProductsQueryOptions = (queryParams: QueryParams) => {
  const limit = queryParams.limit || PRODUCTS_PER_PAGE

  const updatedQueryParams = {...queryParams, limit }
  return {
      queryKey: [COLLECTION_SLUGS.Products, updatedQueryParams],
      queryFn: () => payloadService.getProducts(updatedQueryParams),
      staleTime: 1000 * 60, // минута,
  };
};

export const getAuthorsQueryOptions = (queryParams: QueryParams) => {
  const limit = queryParams.limit || AUTHORS_PER_PAGE

  const updatedQueryParams = {...queryParams, limit }
  return {
      queryKey: [COLLECTION_SLUGS.Authors, updatedQueryParams],
      queryFn: () => payloadService.getAuthors(updatedQueryParams),
      staleTime: 1000 * 60, // минута,
  };
};

export const getProductQueryOptions = ({ slug }: { slug: string}) => {
  return {
      queryKey: [COLLECTION_SLUGS.Products, slug],
      queryFn: () => payloadService.getProductBySlug(slug),
      staleTime: 1000 * 60, // минута,
  };
}

export const getAuthorQueryOptions = ({ slug }: { slug: string}) => {
  return {
      queryKey: [COLLECTION_SLUGS.Authors, slug],
      queryFn: () => payloadService.getAuthorBySlug(slug),
      staleTime: 1000 * 60, // минута,
  };
}