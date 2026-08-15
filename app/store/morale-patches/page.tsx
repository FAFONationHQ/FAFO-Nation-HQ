import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Morale Patches", description: "Current status of future FAFO Nation morale-patch listings." };
export default function MoralePatchesPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Morale" accentTitle="Patches" introduction="This category is intended to present approved FAFO Nation morale patches." statusLabel="Listings — Coming Later" statusText="No patch design, dimensions, material, backing, price, inventory, or availability is currently published by this website." backHref="/store" backLabel="Return to Store" />; }
