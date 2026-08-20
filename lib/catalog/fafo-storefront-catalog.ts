import type { CatalogReader, StorefrontCollection, StorefrontProduct } from "./port";
import { catalogCollections, publishedProducts } from "./index";
import { capabilityIsEnabled } from "../foundation/modules";
import { fafoFoundationModules } from "../foundation/fafo-composition";
import { buildCapabilityRoute } from "../store/build-capabilities";
import type { ProductAction } from "../store/product-actions";

function actionsFor(product: (typeof publishedProducts)[number]): readonly ProductAction[] {
  return product.capabilities.flatMap((capability): ProductAction[] => {
    if (capability.tier === "DEFAULT" && capabilityIsEnabled(fafoFoundationModules, "product.external-purchase")) {
      return [{ id: "external-purchase", label: "Continue to Printify ↗", description: "Select variants and complete purchase through the temporary Printify fallback.", status: "AVAILABLE", href: product.purchase.url, external: true }];
    }
    if (capability.tier === "PERSONALIZATION" && capabilityIsEnabled(fafoFoundationModules, "product.personalization") && capability.status === "REVIEW_REQUIRED") {
      return [{ id: "personalization", label: "Personalize this", description: "Make approved personal changes to this exact product.", status: "REVIEW_REQUIRED", notice: capability.notice }];
    }
    if (capability.tier === "CUSTOM_BUILD" && capabilityIsEnabled(fafoFoundationModules, "product.custom-build") && capability.available) {
      return [{ id: "custom-build", label: "Custom build this", description: "Use this exact product as the base for a deeper custom project.", status: "AVAILABLE", href: buildCapabilityRoute("custom-build", product.slug) }];
    }
    return [];
  });
}

const products: readonly StorefrontProduct[] = publishedProducts.map((product) => ({
  slug: product.slug,
  title: product.title,
  description: product.description,
  collectionSlug: product.collection,
  price: product.price,
  image: product.image,
  actions: actionsFor(product),
}));

const collections: readonly StorefrontCollection[] = catalogCollections.map((collection) => ({
  slug: collection.slug,
  name: collection.name,
  description: collection.description,
  hasPublishedProducts: products.some((product) => product.collectionSlug === collection.slug),
}));

export const fafoStorefrontCatalog: CatalogReader = {
  listPublishedProducts: () => products,
  getPublishedProduct: (slug) => products.find((product) => product.slug === slug),
  listCollections: () => collections,
  getCollection: (slug) => collections.find((collection) => collection.slug === slug),
};
