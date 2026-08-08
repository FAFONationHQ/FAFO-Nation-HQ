import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Featured Deployments", description: "Current status of future featured FAFO Nation gear releases." };
export default function FeaturedStorePage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Featured" accentTitle="Deployments" introduction="Featured Deployments is intended to highlight approved FAFO Nation gear and current public releases." statusLabel="Native Listings — Coming Later" statusText="No featured products, prices, availability, inventory, promotion, or release schedule is currently published by this website." backHref="/store" backLabel="Return to Store" />; }
