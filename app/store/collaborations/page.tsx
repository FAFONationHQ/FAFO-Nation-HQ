import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Apparel Collaborations", description: "Current status of future FAFO Nation apparel collaborations." };
export default function CollaborationsPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Apparel" accentTitle="Collaborations" introduction="This category is intended to present approved FAFO Nation apparel collaborations when legitimate partnership details and products are ready." statusLabel="No Collaboration Published" statusText="No partner, artist, brand, product, endorsement, price, agreement, release date, or availability claim is currently published." backHref="/store" backLabel="Return to Store" />; }
