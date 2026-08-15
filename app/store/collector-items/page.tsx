import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Premium Collector Items", description: "Current status of future premium and collector-focused FAFO Nation items." };
export default function CollectorItemsPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Premium Collector" accentTitle="Items" introduction="This category is intended to present approved premium and collector-focused FAFO Nation items." statusLabel="Listings — Coming Later" statusText="No item, edition, material, quantity, authenticity claim, price, inventory, or availability is currently published." backHref="/store" backLabel="Return to Store" />; }
