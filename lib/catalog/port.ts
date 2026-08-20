import type { Money } from "../foundation/money";
import type { ProductAction } from "../store/product-actions";

export type CatalogImage = Readonly<{ src: string; alt: string }>;

export type StorefrontProduct = Readonly<{
  slug: string;
  title: string;
  description?: string;
  collectionSlug: string;
  price: Money;
  image: CatalogImage;
  actions: readonly ProductAction[];
}>; 

export type StorefrontCollection = Readonly<{
  slug: string;
  name: string;
  description: string;
  hasPublishedProducts: boolean;
}>;

export interface CatalogReader {
  listPublishedProducts(): readonly StorefrontProduct[];
  getPublishedProduct(slug: string): StorefrontProduct | undefined;
  listCollections(): readonly StorefrontCollection[];
  getCollection(slug: string): StorefrontCollection | undefined;
}
