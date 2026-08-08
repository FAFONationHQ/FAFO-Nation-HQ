import type { MetadataRoute } from "next";

import { applicationUrl } from "@/lib/config/application";
import { INTENTIONALLY_BLOCKED_ROUTES } from "@/lib/navigation/public-routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...INTENTIONALLY_BLOCKED_ROUTES],
    },
    sitemap: applicationUrl("/sitemap.xml").toString(),
    host: applicationUrl().origin,
  };
}
