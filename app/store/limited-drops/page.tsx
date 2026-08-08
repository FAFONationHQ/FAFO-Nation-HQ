import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Limited Edition Drops", description: "Current status of future limited-run FAFO Nation releases." };
export default function LimitedDropsPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Limited Edition" accentTitle="Drops" introduction="Limited Edition Drops is intended to present approved limited-run FAFO Nation releases when complete product information is available." statusLabel="No Active Drop" statusText="No product, quantity, price, release time, purchase limit, availability claim, or restock policy is currently published." backHref="/store" backLabel="Return to Store" />; }
