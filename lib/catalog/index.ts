export type PublicationState = "published" | "withheld" | "review-required" | "future";
export type CatalogClassification = "STORE_V1" | "WITHHOLD" | "CUSTOM_GALLERY" | "RESERVED_CUSTOM_ORDER" | "CUSTOM_REVIEW_REQUIRED" | "FUTURE_TRADES";
export type CatalogCollectionSlug = "apparel" | "drinkware" | "accessories" | "headwear" | "fafo-k9-gear" | "reserved-custom-orders" | "fafo-trades";
export type CatalogImage = { src: string; alt: string };
export type ExternalPurchaseDestination = { label: "Purchase on Printify"; url: string };
export type CatalogProduct = { slug: string; title: string; description?: string; priceCad: string; collection: CatalogCollectionSlug; classification: CatalogClassification; publicationState: PublicationState; image: CatalogImage; purchase: ExternalPurchaseDestination };
export type CatalogCollection = { slug: CatalogCollectionSlug; name: string; description: string; publicationState: PublicationState };

export const catalogCollections: CatalogCollection[] = [
  { slug: "apparel", name: "Apparel", description: "Approved Remastered FAFO Nation apparel.", publicationState: "published" },
  { slug: "drinkware", name: "Drinkware", description: "Approved Remastered FAFO Nation drinkware.", publicationState: "published" },
  { slug: "accessories", name: "Accessories", description: "Future collection capability; no approved Store V1 items currently published.", publicationState: "future" },
  { slug: "headwear", name: "Headwear", description: "Future collection capability; no approved Store V1 items currently published.", publicationState: "future" },
  { slug: "fafo-k9-gear", name: "FAFO K9 Gear", description: "Future collection capability; no approved Store V1 items currently published.", publicationState: "future" },
  { slug: "reserved-custom-orders", name: "Reserved / Custom Orders", description: "Items created for specific customers. No listings are published until intent is verified.", publicationState: "future" },
  { slug: "fafo-trades", name: "FAFO Trades", description: "Future collection capability. No products are published in this collection yet.", publicationState: "future" },
];

const listing = (slug: string, title: string, priceCad: string, collection: CatalogCollectionSlug, id: string, imagePath: string, query: string, listingPath: string): CatalogProduct => ({ slug, title, priceCad, collection, classification: "STORE_V1", publicationState: "published", image: { src: `https://images-api.printify.com/mockup/${id}/${imagePath}?${query}`, alt: title }, purchase: { label: "Purchase on Printify", url: `https://fafo-nation-hq.printify.me/product/${listingPath}` } });

export const catalogProducts: CatalogProduct[] = [
  listing("becca-got-your-6", "FAFO Cares Becca Beating Cancer Got your 6 Remastered T Shirt", "CA$41.61", "apparel", "6a46b7244144d0b569037155", "83516/51812/fafo-cares-becca-beating-cancer-got-your-6-remastered-t-shirt.jpg", "camera_label=front&revision=1786454374005", "29716703/fafo-cares-becca-beating-cancer-got-your-6-remastered-t-shirt"),
  listing("becca-phoenix-rising", "FAFO Cares Becca Beating Cancer Phoenix Rising Remastered T Shirt", "CA$41.61", "apparel", "6a46882745705605d90ff271", "12100/92570/fafo-cares-becca-beating-cancer-phoenix-rising-remastered-t-shirt.jpg", "camera_label=front&revision=1786428291247", "29713936/fafo-cares-becca-beating-cancer-phoenix-rising-remastered-t-shirt"),
  listing("becca-beating-cancer", "FAFO Cares Becca Beating Cancer Remastered T Shirt", "CA$36.06", "apparel", "6a467829b706a0bfc50e126e", "83516/51812/fafo-cares-becca-beating-cancer-remastered-t-shirt.jpg", "camera_label=front&revision=1786427018363", "29713724/fafo-cares-becca-beating-cancer-remastered-t-shirt"),
  listing("becky-fundraiser", "FAFO Love: Becky Beating Cancer Remastered Fundraiser Shirt", "CA$41.61", "apparel", "6a34b6f0722a0b482e1061ed", "43088/647/fafo-love-becky-beating-cancer-remastered-fundraiser-shirt.jpg", "camera_label=left-side&revision=1786454391874", "29396755/fafo-love-becky-beating-cancer-remastered-fundraiser-shirt"),
  listing("creasy-clean-logo", "FAFO Nation Creasy Clean Remastered Logo", "CA$20.80", "accessories", "6a347c7743bfb44afc0e065a", "78565/41702/fafo-nation-creasy-clean-remastered-logo.jpg", "camera_label=left&revision=1786455397773", "29392435/fafo-nation-creasy-clean-remastered-logo"),
  listing("dont-be-the-cattle-mug", "FAFO Nation Dont be the Cattle Remastered Coffee Mug", "CA$20.80", "drinkware", "6a347412522223b8000662bd", "78565/41702/fafo-nation-dont-be-the-cattle-remastered-coffee-mug.jpg", "camera_label=left&revision=1786434003672", "29391448/fafo-nation-dont-be-the-cattle-remastered-coffee-mug"),
  listing("glowing-grunt-mug", "FAFO Nation Glowing Grunt Remastered Coffee Mug", "CA$18.02", "drinkware", "6a3471da2d7d0f30ad01706b", "78565/41702/fafo-nation-glowing-grunt-remastered-coffee-mug.jpg", "camera_label=left&revision=1786428621299", "29391306/fafo-nation-glowing-grunt-remastered-coffee-mug"),
  listing("basic-consequence-meter", "FAFO Nation Basic Consequence Meter Remastered T Shirt", "CA$41.61", "apparel", "6a342d9c95ba471ed50266de", "63300/97993/fafo-nation-basic-consequence-meter-remastered-t-shirt.jpg", "camera_label=back&revision=1786434665174", "29390499/fafo-nation-basic-consequence-meter-remastered-t-shirt"),
  listing("basic-frag-em-all", "FAFO Nation Basic Frag em All Remastered T Shirt", "CA$41.61", "apparel", "6a342d9995ba471ed50266dd", "63300/97993/fafo-nation-basic-frag-em-all-remastered-t-shirt.jpg", "camera_label=back&revision=1786455364670", "29390404/fafo-nation-basic-frag-em-all-remastered-t-shirt"),
  listing("basic-man-in-black", "FAFO Nation Basic Man in Black Remastered T Shirt", "CA$41.61", "apparel", "6a342da095ba471ed50266df", "63300/97993/fafo-nation-basic-man-in-black-remastered-t-shirt.jpg", "camera_label=back&revision=1786433664641", "29390255/fafo-nation-basic-man-in-black-remastered-t-shirt"),
];
export const publishedProducts = catalogProducts.filter((product) => product.publicationState === "published");
export const getProduct = (slug: string) => publishedProducts.find((product) => product.slug === slug);
export const getCollection = (slug: string) => catalogCollections.find((collection) => collection.slug === slug);
