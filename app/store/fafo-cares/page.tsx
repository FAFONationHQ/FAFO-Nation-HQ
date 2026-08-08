import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "FAFO Cares Merchandise", description: "Current status of future merchandise connected to approved FAFO Cares campaigns." };
export default function CaresStorePage() { return <PublicStatusPage eyebrow="FAFO Gear" title="FAFO Cares" accentTitle="Merchandise" introduction="This category is intended for approved merchandise connected to future FAFO Cares campaigns." statusLabel="No Campaign Merchandise Published" statusText="No campaign, beneficiary, charity relationship, donation amount, product, price, inventory, or availability is currently published." backHref="/fafo-cares" backLabel="Learn About FAFO Cares" />; }
