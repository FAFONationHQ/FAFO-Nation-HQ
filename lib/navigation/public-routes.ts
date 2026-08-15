import type { FeatureKey } from "../config/features";

export type PublicRoute = {
  path: `/${string}` | "/";
  feature: FeatureKey;
  includeInSitemap: boolean;
};

export const PUBLIC_ROUTES = [
  { path: "/", feature: "publicSite", includeInSitemap: true },
  { path: "/about", feature: "publicSite", includeInSitemap: true },
  { path: "/about/long-term-vision", feature: "publicSite", includeInSitemap: true },
  { path: "/about/our-story", feature: "publicSite", includeInSitemap: true },
  { path: "/about/sgt-swagger", feature: "publicSite", includeInSitemap: true },
  { path: "/community", feature: "community", includeInSitemap: true },
  { path: "/community/activity", feature: "community", includeInSitemap: true },
  { path: "/community/challenges", feature: "community", includeInSitemap: true },
  { path: "/community/deployed-members", feature: "community", includeInSitemap: true },
  { path: "/community/events", feature: "community", includeInSitemap: true },
  { path: "/community/events-contests", feature: "community", includeInSitemap: true },
  { path: "/community/fafo-family", feature: "community", includeInSitemap: true },
  { path: "/community/giveaways", feature: "community", includeInSitemap: true },
  { path: "/community/member-spotlights", feature: "community", includeInSitemap: true },
  { path: "/community/ranks-achievements", feature: "community", includeInSitemap: true },
  { path: "/community/recognition", feature: "community", includeInSitemap: true },
  { path: "/community/recognition-service", feature: "community", includeInSitemap: true },
  { path: "/contact", feature: "publicSite", includeInSitemap: true },
  { path: "/custom-shop", feature: "customShop", includeInSitemap: true },
  { path: "/custom-shop/gallery", feature: "customShop", includeInSitemap: true },
  { path: "/custom-shop/how-it-works", feature: "customShop", includeInSitemap: true },
  { path: "/custom-shop/listings", feature: "customShop", includeInSitemap: true },
  { path: "/custom-shop/start", feature: "customShop", includeInSitemap: true },
  { path: "/custom-shop/status", feature: "customShop", includeInSitemap: true },
  { path: "/fafo-cares", feature: "fafoCares", includeInSitemap: true },
  { path: "/fafo-world", feature: "fafoWorld", includeInSitemap: true },
  { path: "/join", feature: "memberAccounts", includeInSitemap: true },
  { path: "/media", feature: "media", includeInSitemap: true },
  { path: "/media/behind-the-scenes", feature: "media", includeInSitemap: true },
  { path: "/media/content-wall", feature: "media", includeInSitemap: true },
  { path: "/media/countdown", feature: "media", includeInSitemap: true },
  { path: "/media/featured-artist", feature: "media", includeInSitemap: true },
  { path: "/media/gallery", feature: "media", includeInSitemap: true },
  { path: "/media/game-nights", feature: "media", includeInSitemap: true },
  { path: "/media/interviews", feature: "media", includeInSitemap: true },
  { path: "/media/live", feature: "media", includeInSitemap: true },
  { path: "/media/news", feature: "media", includeInSitemap: true },
  { path: "/media/podcasts", feature: "media", includeInSitemap: true },
  { path: "/media/veteran-stories", feature: "media", includeInSitemap: true },
  { path: "/media/videos", feature: "media", includeInSitemap: true },
  { path: "/recently-deployed", feature: "fafoWorld", includeInSitemap: true },
  { path: "/store", feature: "commerce", includeInSitemap: true },
  { path: "/store/challenge-coins", feature: "commerce", includeInSitemap: true },
  { path: "/store/collaborations", feature: "commerce", includeInSitemap: true },
  { path: "/store/collections", feature: "commerce", includeInSitemap: true },
  { path: "/store/collector-items", feature: "commerce", includeInSitemap: true },
  { path: "/store/community-outreach", feature: "commerce", includeInSitemap: true },
  { path: "/store/fafo-cares", feature: "commerce", includeInSitemap: true },
  { path: "/store/featured", feature: "commerce", includeInSitemap: true },
  { path: "/store/limited-drops", feature: "commerce", includeInSitemap: true },
  { path: "/store/morale-patches", feature: "commerce", includeInSitemap: true },
] as const satisfies readonly PublicRoute[];

export const INTENTIONALLY_BLOCKED_ROUTES = [
  "/fafo-cares/annual-campaign",
  "/fafo-cares/cancer-support",
  "/fafo-cares/emergency-fund",
  "/fafo-cares/fundraising",
  "/fafo-cares/mental-health",
  "/fafo-cares/need-help-now",
  "/fafo-cares/spotlights",
  "/fafo-cares/support",
  "/fafo-cares/veterans",
  "/fafo-cares/volunteer",
] as const;

export const SITEMAP_ROUTES = PUBLIC_ROUTES.filter(
  (route) => route.includeInSitemap,
);
