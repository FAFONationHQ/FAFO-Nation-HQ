import type { MetadataRoute } from "next";

import { applicationUrl } from "@/lib/config/application";
import { SITEMAP_ROUTES } from "@/lib/navigation/public-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map(({ path }) => ({
    url: applicationUrl(path).toString(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
