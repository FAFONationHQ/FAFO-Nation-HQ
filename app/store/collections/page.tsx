import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Gear Collections", description: "Current status of future FAFO Nation gear collections." };
export default function CollectionsPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Gear" accentTitle="Collections" introduction="Collections is intended to organize approved FAFO Nation gear, including future seasonal groupings where applicable." statusLabel="Collections — Coming Later" statusText="No collection names, products, seasonal dates, prices, availability, or inventory are currently published by this website." backHref="/store" backLabel="Return to Store" />; }
