import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Custom Gear Listings", description: "Current status of future approved FAFO Custom Shop listings." };
export default function CustomListingsPage() { return <PublicStatusPage eyebrow="Custom Shop" title="Custom Gear" accentTitle="Listings" introduction="Custom Gear Listings is intended to present approved custom projects that are ready for public purchase or review." statusLabel="No Active Listings" statusText="No custom products, prices, inventories, purchasing options, customer projects, or approval claims are currently published here." backHref="/custom-shop" backLabel="Return to Custom Shop" />; }
